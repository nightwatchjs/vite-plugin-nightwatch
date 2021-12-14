const fs = require('fs');
const path = require('path');

module.exports = function viteNightwatchPlugin() {
  return (function(options) {
    let wsUrl;
    let cdp;

    return {
      name: 'nightwatch-plugin',
      load(id) {
        //console.log('LOAD hook', id)
      },
      resolveId(id, originator, options) {
        //console.log('resolveId hook', id)
      },
      transform(data, id) {
        //console.log('transform hook', id)
      },

      configureServer(server) {
        //console.log('configureServer', server)

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

      // transformIndexHtml(html) {
      //   return html.replace(
      //     /<title>(.*?)<\/title>/,
      //     `<title>Title replaced!</title>`
      //   )
      // },

      buildStart(options) {
        //console.log('buildStart', options)
      },

      buildEnd(options) {
        //console.log('buildEnd', options)
      },

      moduleParsed(moduleInfo) {
        //console.log('moduleParsed', moduleInfo)
      },

      configResolved(info) {
        //console.log('configResolved', info)
      }
    }
  })();
}