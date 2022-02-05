const assert = require('assert');
const fs = require('fs');

describe('Vite Nightwatch plugin basic tests', function() {

  it('test plugin config with defaults', function(done) {
    fs.readFile = (filename, encoding, callback) => {
      assert.ok(filename.endsWith('vite-plugin-nightwatch/src/vue_renderer.html'));
      callback(null, '');
    };

    const Plugin = require('../../index.js');
    const server = Plugin();

    server.configureServer({
      transformIndexHtml(url, data) {
        assert.strictEqual(url, 'http://localhost');

        done();

        return Promise.resolve('')
      },

      middlewares: {
        use(url, fn) {
          assert.strictEqual(url, '/test_render/');

          const req = {
            url: 'http://localhost'
          };
          const res = {};


          fn(req, res);
        }
      }
    });
  });

  it('test plugin config with componentType=react', function(done) {
    fs.readFile = (filename, encoding, callback) => {
      assert.ok(filename.endsWith('vite-plugin-nightwatch/src/react_renderer.html'));
      callback(null, '');
    };

    const Plugin = require('../../index.js');
    const server = Plugin({
      componentType: 'react'
    });

    server.configureServer({
      transformIndexHtml(url, data) {
        assert.strictEqual(url, 'http://localhost');

        done();

        return Promise.resolve('')
      },

      middlewares: {
        use(url, fn) {
          assert.strictEqual(url, '/test_render/');

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
      assert.strictEqual(filename, 'custom_renderer.html');
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
          assert.strictEqual(url, '/test_render/');

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