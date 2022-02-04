module.exports = class Command {
  async command(componentName, opts = {}, cb = function() {}) {

    let pluginImports = '';
    let pluginsContent = '';
    let stubContent = '';
    let mockContent = '';

    if (opts.mocks) {
      const mocks = Object.keys(opts.mocks);

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

      if (mocks.length > 0) {
        mockContent = `import sinon from '/node_modules/sinon/pkg/sinon-esm.js';`;
      }

      let mockFetchItemsContent = mocks.reduce((prev, mockUrl) => {
        const {body, type = 'fetch'} = opts.mocks[mockUrl];
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

      if (mockFetch) {
        mockContent += mockFetchContent;
        mockContent += mockFetchItemsContent;
      }
    }

    const plugins = Object.keys(opts.plugins || {});
    if (plugins.length > 0) {
      pluginImports = plugins.reduce((prev, plugin) => {
        prev += `import ${plugin} from '${opts.plugins[plugin]}'\n`;

        return prev;
      }, '');

      pluginsContent = plugins.join(',');
    }

    let scriptContent = `import {mount} from '/node_modules/@vue/test-utils/dist/vue-test-utils.esm-browser.js'
  import Component from '${componentName}'
  ${pluginImports}
  ${mockContent}
       let element = mount(Component, {
         attachTo: document.getElementById('app'),
         global: {
           plugins: [${pluginsContent}]
         }
       });
       window['@component_element'] = element;
       window['@component_class'] = Component;
       `

    const scriptFn = function(scriptContent) {
      var scriptEl = document.createElement('script');
      scriptEl.type = 'module';
      scriptEl.innerHTML = scriptContent;
      document.body.appendChild(scriptEl);
    }

    const renderedElement = await this.api
      .launchComponentRenderer()

      .pause(1000)
      .execute(scriptFn, [scriptContent])

      .pause(this.client.argv.debug ? 0 : 500)

      .execute(function() {
        return document.querySelectorAll('#app')[0].firstElementChild
      }, [], (result) => {
        if (!result || !result.value) {
          throw new Error('Could not mount the component. Run nightwatch with --devtools and --debug flags (Chrome only) and investigate the error in the browser console.')
        }

        const componentInstance = this.api.createElement(result.value, {
          isComponent: true,
          type: 'vue'
        });

        cb(componentInstance);

        return componentInstance;
      });

    return renderedElement;
  }
}