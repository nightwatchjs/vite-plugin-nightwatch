const fs = require('fs');
const path = require('path');
const CDPConnection = require('./src/cdp.js');
const {createServer: createViteServer} = require('vite');

module.exports = function viteNightwatchPlugin(options = {}) {
  const componentType = options.componentType || 'vue';
  const enableCdpConnection = options.enableCdpConnection || false;

  let defaultRenderPage;
  switch (componentType) {
    case 'react':
      defaultRenderPage = 'src/react_renderer.html';
      break;
    default:
      defaultRenderPage = 'src/vue_renderer.html';
  }

  defaultRenderPage = path.join('node_modules', 'vite-plugin-nightwatch', defaultRenderPage);

  return (function () {
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

          const testRenderer = options.renderPage || defaultRenderPage;

          fs.readFile(testRenderer, 'utf-8', function (err, data) {
            if (err) {
              throw err;
            }

            if (wsUrl && enableCdpConnection) {
              setTimeout(function() {
                cdp = new CDPConnection(wsUrl);
              }, 100)
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