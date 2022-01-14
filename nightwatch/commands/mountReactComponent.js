module.exports = class Command {
    async command(componentName, props, cb = function() {}) {

        let scriptContent = `
            import Component from '${componentName}'
            var reactElement = React.createElement(Component)
            let element = ReactDOM.render(reactElement, document.getElementById('app'));
            window['@component_element'] = element;
            window['@component_class'] = Component;
            console.log('component element', reactElement)
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
        .navigateTo('/test_render/')
        .pause(2000)
        .execute(scriptFn, [scriptContent])
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