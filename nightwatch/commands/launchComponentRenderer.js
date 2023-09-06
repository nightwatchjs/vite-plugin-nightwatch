module.exports = class Command {
  async command() {
    let launchUrl = '';
    const {vite_dev_server, vite_port} = this.client.settings;

    if (vite_dev_server) {
      const port = vite_dev_server.port || 5173;
      launchUrl = `http://localhost:${port}`;
    } else if (this.api.globals.launchUrl) {
      launchUrl = this.api.globals.launchUrl;
    }

    if (global.viteServer) {
      const protocol = global.viteServer.config.server.https ? 'https' : 'http';
      launchUrl = `${protocol}://localhost:${global.viteServer.config.port}`;
    }

    return this.api.navigateTo(`${launchUrl}/_nightwatch/`);
  }
};
