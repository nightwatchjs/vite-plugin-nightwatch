module.exports = class Command {
  async command(componentName, props, cb = function() {}) {
    const reactEntryPoint = this.api.globals.entryPoint || '/node_modules/vite-plugin-nightwatch/src/react_index.js';

    let propsFromFn = '';
    if (typeof props == 'function') {
      propsFromFn = `(${props.toString()})()`;
    }

    let scriptContent = `
    import ReactLibs from '${reactEntryPoint}';
    const {React, ReactDOM} = ReactLibs;
    import Component from '${componentName}';
    const props = ${propsFromFn || (typeof props == 'string' ? props : JSON.stringify(props))};
    const element = React.createElement(Component, props);
    ReactDOM.render(element, document.getElementById('app'));
    window['@component_element'] = element;
    window['@component_class'] = Component;
    `;
  
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
          type: 'react'
        });

        cb(componentInstance);

        return componentInstance;
      });

    return renderedElement;
  }
}
