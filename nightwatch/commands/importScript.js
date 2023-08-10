module.exports = class Command {
  async command(scriptFileName, {scriptType = 'module', componentType = 'vue'} = {}, cb = function() {}) {

    const scriptFn = function(scriptFileName, scriptType) {
      var scriptEl = document.createElement('script');
      if (scriptType) {
        scriptEl.type = scriptType;
      }
      scriptEl.src = scriptFileName;
      document.body.appendChild(scriptEl);
    };

    const result = await this.api
      .execute(scriptFn, [scriptFileName, scriptType])
      .pause(500)
      .execute(function() {
        return document.querySelectorAll('#app')[0].firstElementChild;
      }, []);

    const componentInstance = this.api.createElement(result, {
      isComponent: true,
      type: componentType
    });

    cb(componentInstance);

    return componentInstance;
  }
};
