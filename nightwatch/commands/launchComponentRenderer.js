module.exports = class Command {
  async command() {
    let launchUrl = new URL(this.api.globals.launchUrl ?? this.client.settings.launchUrl ?? 'http://localhost:5173');
    const { vite_dev_server, vite_port } = this.client.settings;

    if (vite_dev_server) {
      launchUrl.port = vite_port || 5173
    }

    if (global.viteServer) {
      launchUrl.port = global.viteServer.config.port;
    }

    launchUrl.pathname = '/_nightwatch/';

    console.log(launchUrl.toString());

    return this.api.navigateTo(launchUrl.toString());
  }
};
