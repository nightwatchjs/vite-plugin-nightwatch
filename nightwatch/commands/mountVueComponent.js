module.exports = class Command {
  async command(componentName, cb = function() {}) {

    const scriptFn = function(componentName) {
      var scriptEl = document.createElement('script');
      scriptEl.type = 'module';
      scriptEl.innerHTML = `
       import {mount} from '/node_modules/@vue/test-utils/dist/vue-test-utils.esm-browser.js'
       import Component from '${componentName}'
       mount(Component, {
         attachTo: document.getElementById('app')
       });`;
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
      .execute(scriptFn, [componentName])
      .pause(500)
      .execute(function() {
        return document.querySelectorAll('#app')[0].firstChild
      }, [], (result) => {
        cb(result)

        if (!result || !result.value) {
          return null;
        }

        return element(result.value);
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