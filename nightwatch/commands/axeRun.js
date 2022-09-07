const {command} = require('nightwatch-axe-verbose/nightwatch/commands/axeRun.js')
module.exports = class AxeRun {
  command(selector = '#app', ...args) {
    return command.call(this.api, selector, args);
  }
}