const fs = require('fs');
const path = require('path');
const CDPConnection = require('./src/cdp.js');
const {injectRendererName, injectScript} = require('./src/utils/');

module.exports = function viteNightwatchPlugin(options = {}) {
  const enableCdpConnection = options.enableCdpConnection || false;

  const renderPage = options.renderPage
    ? path.resolve(options.renderPage)
    : path.resolve(__dirname, 'src', 'renderer.html');

  const componentType = options.componentType || 'vue';

  return (function () {
    let wsUrl;
    let cdp;

    return {
      name: 'nightwatch-plugin',

      configResolved(config) {
        process.env.BASE_VITE_URL = `http://${config.server.host}:${config.server.port || 5173}`;
      },

      configureServer(server) {
        server.middlewares
          // .use(serveStatic(rendererRoot, { index: false }))
          .use('/_nightwatch', (req, res, _next) => {
            // custom handle request...
            const wsUrlParts = decodeURIComponent(req.url).split('?wsurl=');
            if (wsUrlParts.length === 2) {
              wsUrl = wsUrlParts[1];
            }

            fs.readFile(renderPage, {encoding: 'utf-8'}, (error, data) => {
              if (error) {
                throw error;
              }

              if (wsUrl && enableCdpConnection) {
                setTimeout(function () {
                  cdp = new CDPConnection(wsUrl);
                }, 100);
              }

              const componentPath = new URLSearchParams(req.url.split('?')[1]).get('file');
              const htmlWithTitle = injectRendererName(data, componentType);

              // Transform HTML using Vite plugins.
              server
                .transformIndexHtml(
                  req.url,
                  componentPath  ? injectScript(htmlWithTitle, componentType, componentPath) : htmlWithTitle
                )
                .then((result) => res.end(result))
                .catch((err) => res.end(err.message));
            });
          });
      }
    };
  })();
};

