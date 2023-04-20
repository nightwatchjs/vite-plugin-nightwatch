const AssertionError = require('assertion-error');

class NightwatchMountError extends AssertionError {
  constructor(message) {
    super(message);

    this.name = 'NightwatchMountError';
  }
}

module.exports = class Command {
  get pluginSettings() {
    return this.client.settings['@nightwatch/vue'] || {};
  }

  getError(message) {
    const err = new NightwatchMountError(message);

    err.showTrace = false;
    err.help = [
      'run nightwatch with --devtools and --debug flags (Chrome only)',
      'investigate the error in the browser console'
    ];

    return err;
  }

  async mountComponent(componentName, opts, isRetry = false) {
    this.api.execute(function (innerHTML) {
      function onReady(fn) {if (document.readyState === 'complete' || document.readyState === 'interactive') {setTimeout(fn)} else {document.addEventListener('DOMContentLoaded', fn)}}
      onReady(function() {
        var scriptTag = Object.assign(document.createElement('script'), {
          type: 'module',
          innerHTML
        });
        document.body.appendChild(scriptTag);
      });
    }, [Command._buildScript(componentName, opts)], async (result) => {
      if (result && (result.error instanceof Error) && !isRetry) {
        return this.mountComponent(componentName, opts, true);
      }

      return result;
    });
  }

  async command(componentName, opts = {}, cb = function() {}) {
    const {
      hooksRetryTimeout = 10000,
      hooksRetryInterval = 150,
      playFnTimeout = 20000,
      playFnRetryInterval = 100
    } = this.pluginSettings;

    await this.api.launchComponentRenderer();
    await this.mountComponent(componentName, opts);

    await this.api
      .waitUntil(async () => {
        if (this.client.argv.debug) {
          return true;
        }

        const result = await this.api.execute(function() {
          return !!window['@@component_class'];
        });

        return !!result;
      }, hooksRetryTimeout, hooksRetryInterval, this.getError(`time out reached (${hooksRetryTimeout}ms) while waiting for component to mount.`))

      // run the play() function
      .execute(function(innerHTML) {
        var scriptTag = Object.assign(document.createElement('script'), {
          type: 'module',
          innerHTML
        });
        document.body.appendChild(scriptTag);
      }, [`
        const Component = window['@@component_class'];
        
        if (Component && (typeof Component.play == 'function')) {
          try {
            window['@@playfn_result'] = await Component.play({
              component: window['@@component_element']
            }) || {};
          } catch (err) {
            console.error('Error while executing .play() function:', err);
            window.__$$PlayFnError = err;
          }
        }
        window.__$$PlayFnDone = true;
      `]);

    if (this.client.argv.debug) {
      await this.api.debug();
    } else if (this.client.argv.preview) {
      await this.api.pause();
    }

    const result = await this.api.execute(function() {
      return document.querySelectorAll('#app')[0].firstElementChild;
    }, []);

    if (!result) {
      const err = this.getError('Could not mount the component.');

      return err;
    }

    const componentInstance = this.api.createElement(result, {
      isComponent: true,
      type: 'vue'
    });

    cb(componentInstance);

    return componentInstance;
  }

  static _getVueImports(plugins = {}) {
    const definitions = Object.keys(plugins);

    let pluginImports = '';
    if (definitions.length > 0) {
      pluginImports = definitions.reduce((prev, plugin) => {
        prev += `import ${plugin} from '${plugins[plugin]}'\n`;

        return prev;
      }, '');
    }

    return `
			import {mount} from '/node_modules/@vue/test-utils/dist/vue-test-utils.esm-browser.js';
			${pluginImports}
		`;
  }

  static _getMockContent(mocks = {}) {
    const definitions = Object.keys(mocks);

    let mockContent = '';
    let mockFetch = false;
    const mockFetchContent = `
  function mockApiResponse(body) {
    return new window.Response(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-type': 'application/json'
      }
    });
  }
  
  const stubedFetch = sinon.stub(window, 'fetch');
      `;

    let mockFetchItemsContent = '';
    if (definitions.length > 0) {
      mockContent = 'import sinon from \'/node_modules/sinon/pkg/sinon-esm.js\';';
      mockFetchItemsContent = definitions.reduce((prev, mockUrl) => {
        const {body, type = 'fetch'} = mocks[mockUrl];
        if (type === 'fetch') {
          mockFetch = true;
        }

        prev += `
  stubedFetch.withArgs('${mockUrl}').returns(sinon.promise(function (resolve, reject) {
    resolve(mockApiResponse(${JSON.stringify(body)}));
  }));
      `;

        return prev;
      }, '');
    }

    if (mockFetch) {
      mockContent += mockFetchContent;
      mockContent += mockFetchItemsContent;
    }

    return mockContent;
  }

  static _buildScript(componentName, opts = {}) {
    let pluginsContent = '';

    if (opts.plugins) {
      const definitions = Object.keys(opts.plugins);
      pluginsContent = definitions.join(',');
    }

    return `
      ${Command._getVueImports(opts.plugins)}
      import Component from '${componentName}'
      
      ${Command._getMockContent(opts.mocks)}
      
      let element = mount(Component, {
        attachTo: document.getElementById('app'),
        props: ${JSON.stringify(opts.props)},
        global: {
          plugins: [${pluginsContent}]
        }
      });
      window['@@component_element'] = element;
      window['@@component_class'] = Component; 
      window['@@playfn_result'] = null;
      window.__$$PlayFnError = null;
      window.__$$PlayFnDone = false;           
    `;
  }
};
