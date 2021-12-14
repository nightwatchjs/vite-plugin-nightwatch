module.exports = class Command {
  async command(scriptFileName, type = '', cb = function() {}) {

    const scriptFn = function(scriptFileName, scriptType) {
      var scriptEl = document.createElement('script');
      if (scriptType) {
        scriptEl.type = scriptType;
      }
      scriptEl.src = scriptFileName;
      document.body.appendChild(scriptEl);
    }

    const element = await this.api
      .navigateTo('/test_render/')
      .execute(scriptFn, [scriptFileName, type])
      .pause(500)
      .execute(function() {
        return document.querySelectorAll('#app')[0].firstChild
      }, [], (result) => {
        cb(result)

        return result.value;
      });

    return element;
  }
}

// import {mount} from '/node_modules/@vue/test-utils/dist/vue-test-utils.esm-browser.js'
// const wrapper = mount(TopNavbar, {
//   attachTo: document.getElementById('app')
// });
//
// console.log('wrapper', wrapper);