module.exports = class Command {
  async command(componentName, opts = {}) {

    let pluginImports = '';
    let pluginsContent = '';
    const plugins = Object.keys(opts.plugins);
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
       let element = mount(Component, {
         attachTo: document.getElementById('app'),
         global: {
           plugins: [${pluginsContent}]
         }
       });
       window['@component_element'] = element;
       window['@component_class'] = Component;
       console.log('component element', element)
       console.log('Component', Component)
       `

    const scriptFn = function(scriptContent) {
      var scriptEl = document.createElement('script');
      scriptEl.type = 'module';
      scriptEl.innerHTML = scriptContent;
      document.body.appendChild(scriptEl);
    }

    const {debuggerAddress} = this.api.capabilities['goog:chromeOptions'] || {};
    let wsUrl;
    if (debuggerAddress) {
      const address = debuggerAddress.split(':');
      const request = await this.httpRequest({
        host: address[0],
        port: address[1],
        path: '/json',
        method: 'GET'
      });

      wsUrl = request.filter(item => {
        return item.type === 'page'
      })[0].webSocketDebuggerUrl;
    }

    let wsUrlSection = '';
    if (wsUrl) {
      //wsUrlSection = '?wsurl=' + encodeURIComponent(wsUrl);
    }

    const renderedElement = await this.api
      .navigateTo('/test_render/' + wsUrlSection)
      .execute(scriptFn, [scriptContent])
      .pause(500)
      .execute(function() {
        return document.querySelectorAll('#app')[0].firstElementChild
      }, [], (result) => {


        if (!result || !result.value) {
          return null;
        }

        const componentInstance = element(result.value);

        return componentInstance;
      });

    return renderedElement;
  }
}

// import {mount} from '/node_modules/@vue/test-utils/dist/vue-test-utils.esm-browser.js'
// const wrapper = mount(TopNavbar, {
//   attachTo: document.getElementById('app')
// });
//
// console.log('wrapper', wrapper);