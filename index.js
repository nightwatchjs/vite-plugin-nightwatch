const fs = require('fs');
const path = require('path');

module.exports = function viteNightwatchPlugin() {
  return (function(options) {
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
          fs.readFile(testRenderer, 'utf8', function(err, data) {
            if (err) {
              throw err;
            }

            if (wsUrl) {
              // setTimeout(function() {
              //   cdp = new CDPConnection(wsUrl);
              // }, 100)
            }

            res.end(data);
          });
        })
      },

      configResolved(info) {
        logger = info.logger;
      }
    }
  })();
}