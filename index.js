const fs = require('fs');
const path = require('path');
const {createServer: createViteServer} = require('vite');

module.exports = function viteNightwatchPlugin() {
  return (function (options) {
    let wsUrl;
    let logger;
    let cdp;

    return {
      name: 'nightwatch-plugin',
      configureServer(server) {
        server.middlewares.use('/test_render/', (req, res, next) => {
          // custom handle request...
          const wsUrlParts = decodeURIComponent(req.url).split('?wsurl=');
          if (wsUrlParts.length === 2) {
            wsUrl = wsUrlParts[1];
          }

          const testRenderer = path.join('node_modules', 'vite-plugin-nightwatch', 'src/test_renderer.html');
          fs.readFile(testRenderer, 'utf-8', function (err, data) {

            if (err) {
              throw err;
            }

            if (wsUrl) {
              // setTimeout(function() {
              //   cdp = new CDPConnection(wsUrl);
              // }, 100)
            }

            // Transform HTML using Vite plugins.
            server.transformIndexHtml(req.url, data)
              .then(result => res.end(result))
              .catch(err => res.end(err.message))
          });
        })
      },

      configResolved(info) {
        logger = info.logger;
      }
    }
  })();
}