const path = require('path');
const vite = require('./vite.js');

const startViteForVue = function() {
  return vite.start({
    configFile: path.join(__dirname, 'vite.config-vue.js')
  });
}

const startViteForReact = function() {
  return vite.start({
    configFile: path.join(__dirname, 'vite.config-react.js')
  });
}

const startViteForSvelte = function() {
  return vite.start({
    configFile: path.join(__dirname, 'vite.config-svelte.js')
  });
}

let viteServer;
module.exports = {
  async before() {
    switch (this.componentType) {
      case 'react':
        viteServer = await startViteForReact();
        break;
      case 'vue':
        viteServer = await startViteForVue();
        break;
      case 'svelte':
        viteServer = await startViteForSvelte();
        break;
    }

    const port = viteServer.config.server.port;

    this.launchUrl = `http://localhost:${port}`;
  },

  async after() {
    await viteServer.close();
  }
}