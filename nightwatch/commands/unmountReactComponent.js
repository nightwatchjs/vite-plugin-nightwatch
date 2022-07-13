module.exports = class Command {
  async command(cb = function() {}) {
    const reactEntryPoint = this.api.globals.entryPoint || '/node_modules/vite-plugin-nightwatch/src/react_index.js';

    let scriptContent = `
        import ReactLibs from '${reactEntryPoint}';
        const {ReactDOM} = ReactLibs
        ReactDOM.unmountComponentAtNode(document.getElementById('app'));
        `
    const scriptFn = function(scriptContent) {
      var scriptEl = document.createElement('script');
      scriptEl.type = 'module';
      scriptEl.innerHTML = scriptContent;
      document.body.appendChild(scriptEl);
    }

   await this.api
      .execute(scriptFn, [scriptContent])
      .pause(500)
    
    return cb();
  }
}