const enableCdpConnection = false;

module.exports = class Command {
  async command() {
    const {debuggerAddress} = this.api.capabilities['goog:chromeOptions'] || {};
    let wsUrl;
    if (debuggerAddress && enableCdpConnection) {
      const address = debuggerAddress.split(':');
      const request = await this.httpRequest({
        host: address[0],
        port: address[1],
        path: '/json',
        method: 'GET'
      });

      wsUrl = request.filter(item => {
        return item.type === 'page'
      })[0].webSocketDebuggerUrl;
    }

    let wsUrlSection = '';
    // Disabled for now
    if (wsUrl) {
      //wsUrlSection = '?wsurl=' + encodeURIComponent(wsUrl);
    }

    let launchUrl = '';
    if (this.api.globals.launchUrl) {
      launchUrl = this.api.globals.launchUrl;
    }

    return this.api.navigateTo(`${launchUrl}/test_render/${wsUrlSection}`);
  }
}