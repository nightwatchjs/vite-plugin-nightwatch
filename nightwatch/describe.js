window.__$$NightwatchDescribe = null;
window.describe = function(name, fn) {
  window.__$$NightwatchDescribe = new Error('Using describe with JSX tests is not supported.');
};

window.it = window.test = function(name, fn) {
};