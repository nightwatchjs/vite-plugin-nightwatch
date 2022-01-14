module.exports = class Command {
    async command(componentName, props, cb = function() {}) {
  
      const scriptFn = function(componentName, props) {
        var scriptEl = document.createElement('script');
        scriptEl.type = 'module';
        scriptEl.innerHTML = `
        import Component from '${componentName}'
        var reactElement = React.createElement(Component, ${props})
        ReactDOM.render(reactElement, document.getElementById('app'));`;
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
        .navigateTo('/test_render/')
        .pause(2000)
        .execute(scriptFn, [componentName, props])
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