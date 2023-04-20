# vite-plugin-nightwatch

Component testing plugin that integrates [Vite](https://vitejs.dev/) with [Nightwatch.js](https://nightwatchjs.org/). Supports Vue and React components.

[![Vue Tests Status][build-badge]][build]
[![version][version-badge]][package]
[![Discord][discord-badge]][discord]
[![MIT License][license-badge]][license]

```
npm install vite-plugin-nightwatch
```

## Usage:
Update your [Vite configuration](https://vitejs.dev/config/):

### 
```js
import nightwatchPlugin from 'vite-plugin-nightwatch'

export default {
  plugins: [
    // ... other plugins, such as vue() or react()
    nightwatchPlugin()
  ]
}
```

Nightwatch assumes the Vite dev server is already running and will be using `http://localhost:3000` as base url. You can change that in your `nightwatch.conf.js` by setting either `launchUrl` or `baseUrl` properties.

To start the Vite dev server, in your project run:
```sh
npm run dev
```

## Configuration:
The plugin accepts a few config options:

### - componentType:
Specify the type of component to be tested. Possible values:
- `vue` (default, if none specified)
- `react`

```js
export default {
  plugins: [
    // ... other plugins, such as vue() or react()
    nightwatchPlugin({
      componentType: 'vue'
    })
  ]
}
```

### - renderPage:
Specify the path to a custom test renderer to be used. Default renderers are included in the package for both Vue and React components, but this option can overwrite that value.

```js
export default {
  plugins: [
    // ... other plugins, such as vue() or react()
    nightwatchPlugin({
      renderPage: './src/test_renderer.html'
    })
  ]
}
```

## API Commands
This plugin includes a few Nightwatch commands which can be used while writing tests.

### - browser.mountVueComponent(`componentPath` ,`[options]`, `[callback]`):
**Parameters:**
- `componentPath` – location of the component file (`.vue`) to be mounted
- `options` – this can include:
  - `props` - properties to be passed to the Vue component, this will be serialized to JSON
  - `plugins`: if needed, a store (VueX or Pinia) and a router can be loaded together with the component
  - `mocks`: this can be a list of url calls that can be mocked (will be passed to [sinon](https://sinonjs.org/) automatically); at the moment only [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) calls can be mocked, but XHR support will be added soon.  
- `callback` – an optional callback function which will be called with the component element

#### Example:
```js
const component = await browser.mountVueComponent('/src/components/Form.vue', {
  plugins: {
    store: '/src/lib/store.js',
    router: '/src/lib/router.js'
  },

  mocks: {
    '/api/get-user': {
      type: 'fetch',
      body: {
        data: {
          "firstName": "Jimmy",
          "lastName": "Hendrix"
        }
      }
    }
  }
})
```

### - browser.mountReactComponent(`componentPath`, `[props]`, `[callback]`):
**Parameters:**
- `componentPath` – location of the component file (`.jsx`) to be mounted
- `props` – properties to be passed to the React component, this will be serialized to JSON
- `callback` – an optional callback function which will be called with the component element

#### Example:
```js
const component = await browser.mountReactComponent('/src/components/Form.jsx')
```

### - browser.launchComponentRenderer():
This will call `browser.navigateTo('/nightwatch/')` and open the browser. Needs to be used before the `.importScript()` command, if used.

You can also set `launchUrl` as a global at runtime and then the url to be used will be `${browser.globals.launchUrl}/nightwatch`, which makes it possible to set the launch url dynamically. 

### - browser.importScript(`scriptPath`, `[options]`, `[callback]`):
**Parameters:**
- `scriptPath` – location of the script file to inject into the page which will render the component; needs to be written in ESM format
- `options` – this can include:
  - `scriptType`: the `type` attribute to be set on the `<script>` tag (default is `module`)
  - `componentType`: either `vue` or `react` (default is `vue`)
- `callback` – an optional callback function which will be called with the component element

#### Example:
```js
const formComponent = await browser
  .launchComponentRenderer()
  .importScript('/test/lib/scriptToImport.js');
```

Example `scriptToImport.js`:
```js
import {mount} from '/node_modules/@vue/test-utils/dist/vue-test-utils.esm-browser.js'
import Component from '/test/components/vue/Form.vue'

let element = mount(Component, {
 attachTo: document.getElementById('app'),
 global: {
   plugins: []
 }
});

// This will be used by Nightwatch to inspect properties of this component
window['@@component_element'] = element;
```

## Debugging Component Tests
Debugging component tests in Nightwatch isn't as straightforward as debugging a regular Node.js application or service, since Nightwatch needs to inject the code to render to component into the browser.

However, for when running the tests in Chrome, you can use the DevTools to do debugging directly in the browser. For this purpose, Nightwatch provide 2 CLI flags:
- `--devtools` - when this is on, the Chrome DevTools will open automatically
- `--debug` - this will cause the test execution to pause right after the component is rendered


## Running the Vite dev-server programmatically from Nightwatch 
It is also possible to start the Vite dev server from the Nightwatch global `before` hook and close it in the `after` hook.

We are doing that as part of the tests for this plugin. Here's how your external `globals.js` file should look like:

__globals.js__
```js
const path = require('path');
const vite = require('./vite.js');

const startViteForVue = function() {
  return vite.start({
    configFile: path.join(__dirname, 'vite.config-vue.js')
  });
}

const startViteForReact = function() {
  return vite.start({
    configFile: path.join(__dirname, 'vite.config-react.js')
  });
}

let viteServer;
module.exports = {
  async before() {
    switch (this.componentType) {
      case 'react':
        viteServer = await startViteForReact();
        break;
      case 'vue':
        viteServer = await startViteForVue();
        break;
    }

    const port = viteServer.config.server.port;

    // set the launch url dynamically
    this.launchUrl = `http://localhost:${port}`;
  },

  async after() {
    await viteServer.close();
  }
}
```

Also inspect the included [nightwatch.conf.js](nightwatch.conf.js) and the [vite dev server](test/lib/vite.js) start up script.

## Run tests:

Tests for this project are written in Nightwatch so you can inspect them as examples, located in the [tests/specs] folder.

To run the Vue component tests:

```sh
npm test
```

To run the React component tests:

```sh
npm run test-react
```
 

## License
MIT

[build-badge]: https://github.com/nightwatchjs/vite-plugin-nightwatch/actions/workflows/tests.yml/badge.svg?branch=main
[build]: https://github.com/nightwatchjs/vite-plugin-nightwatch/actions/workflows/vue-tests.yml
[version-badge]: https://img.shields.io/npm/v/vite-plugin-nightwatch.svg?style=flat-square
[package]: https://www.npmjs.com/package/vite-plugin-nightwatch
[license-badge]: https://img.shields.io/npm/l/vite-plugin-nightwatch.svg?style=flat-square
[license]: https://github.com/nightwatchjs/vite-plugin-nightwatch/blob/main/LICENSE
[discord-badge]: https://img.shields.io/discord/618399631038218240.svg?color=7389D8&labelColor=6A7EC2&logo=discord&logoColor=ffffff&style=flat-square
[discord]: https://discord.gg/SN8Da2X
