module.exports = class Command {
  async command() {
    let launchUrl = '';
    const {vite_dev_server} = this.client.settings;
    if (vite_dev_server && vite_dev_server.port) {
      launchUrl = `http://localhost:${vite_dev_server.port}`;
    } else if (this.api.globals.launchUrl) {
      launchUrl = this.api.globals.launchUrl;
    }

    return this.api.navigateTo(`${launchUrl}/nightwatch/`);
  }
}