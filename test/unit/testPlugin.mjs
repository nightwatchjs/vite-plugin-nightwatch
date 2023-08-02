import { ok, strictEqual } from 'assert';
import fs from 'fs';

describe('Vite Nightwatch plugin basic tests', function() {

  it.only('test plugin config with defaults', function(done) {
    fs.readFile = (filename, encoding, callback) => {
      ok(filename.endsWith('vite-plugin-nightwatch/src/renderer.html'));
      callback(null, '');
    };

    import('../../index.mjs').then(({default: Plugin}) => {
      const server = Plugin();

      server.configureServer({
        transformIndexHtml(url, data) {
          strictEqual(url, 'http://localhost');
  
          done();
  
          return Promise.resolve('')
        },
  
        middlewares: {
          use(url, fn) {
            strictEqual(url, '/_nightwatch');
  
            const req = {
              url: 'http://localhost'
            };
            const res = {};
  
  
            fn(req, res);
          }
        }
      });
    }).catch(e => {
      done(e)
    });
    
  });

  it('test plugin config with componentType=react', function(done) {
    fs.readFile = (filename, encoding, callback) => {
      ok(filename.endsWith('vite-plugin-nightwatch/src/renderer.html'));
      callback(null, '');
    };

    const Plugin = require('../../index.js');
    const server = Plugin({
      componentType: 'react'
    });

    server.configureServer({
      transformIndexHtml(url, data) {
        strictEqual(url, 'http://localhost');

        done();

        return Promise.resolve('')
      },

      middlewares: {
        use(url, fn) {
          strictEqual(url, '/_nightwatch');

          const req = {
            url: 'http://localhost'
          };
          const res = {};


          fn(req, res);
        }
      }
    });
  });

  it('test plugin config with custom renderPage', function(done) {
    fs.readFile = (filename, encoding, callback) => {
      ok(filename.endsWith('custom_renderer.html'));
      callback(null, '');
    };

    const Plugin = require('../../index.js');
    const server = Plugin({
      renderPage: 'custom_renderer.html'
    });

    server.configureServer({
      transformIndexHtml(url, data) {
        done();

        return Promise.resolve('')
      },

      middlewares: {
        use(url, fn) {
          strictEqual(url, '/_nightwatch');

          const req = {
            url: 'http://localhost'
          };
          const res = {};


          fn(req, res);
        }
      }
    });
  });
});