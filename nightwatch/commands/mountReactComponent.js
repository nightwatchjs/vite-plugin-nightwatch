const AssertionError = require('assertion-error');
const fs = require('fs');
const path = require('path');

const {TMP_TEST_NAME, writeTmpTestFile} = require('../../src/tmp_file.js');

class NightwatchMountError extends AssertionError {
  constructor(message) {
    super(message);

    this.name = 'NightwatchMountError';
  }
}

module.exports = class Command {
  static get rootElementId() {
    return 'app';
  }

  get pluginSettings() {
    return this.client.settings['@nightwatch/react'] || {};
  }

  getError(message) {
    const err = new NightwatchMountError(message);

    err.showTrace = false;
    err.help = [
      'run nightwatch with --devtools and --debug flags (Chrome/Edge only)',
      'investigate the error in the browser console'
    ];

    return err;
  }

  async command(componentOrName, props = null, onInstanceAvailable = function () {}) {
    const isObject = typeof componentOrName == 'object' && componentOrName.path;
    const componentPath = isObject ? componentOrName.path : componentOrName;
    const isJSX = isObject && (componentOrName.path.endsWith('.jsx') || componentOrName.path.endsWith('.tsx'));

    const fileName = componentPath ? `${path.parse(componentPath).name.toLowerCase()}__${Math.floor(Math.random() * 1000)}__imports.js` : TMP_TEST_NAME;

    const {
      hooksRetryTimeout = 10000,
      hooksRetryInterval = 250,
      playFnTimeout = 20000,
      playFnRetryInterval = 250
    } = this.pluginSettings;

    let preRenderError;
    let postRenderError;

    await this.api.perform(async function() {
      await Command._createEntryScriptFile({fileName, componentOrName, props, isJSX});
    }).launchComponentRenderer().pause(100);

    // mount component
    await this.api
      .executeAsyncScript(function (fileName, done) {
        function onReady(fn) {if (document.readyState === 'complete' || document.readyState === 'interactive') {setTimeout(fn)} else {document.addEventListener('DOMContentLoaded', fn)}}

        onReady(function() {
          var scriptTag = document.createElement('script');
          scriptTag.src = `/nightwatch/.cache/${fileName}?t=${Math.random().toString(36)}`;
          scriptTag.type = 'module';
          scriptTag.onload = function () {
            done();
          };

          document.body.appendChild(scriptTag);
        });
      }, [fileName])

    // FIXME: writing the waitUntil outside of the perform using await, breaks the chain

      // waiting for the preRender (if any) to finish
      .waitUntil(async () => {
        if (this.client.argv.debug) {
          return true;
        }

        const result = await this.api.execute(function() {
          if (window.__$$BeforeMountError) {
            return {error: window.__$$BeforeMountError};
          }

          return !!window['@component_class'];
        });

        if (result && typeof result.error == 'string') {
          preRenderError = new Error('Error while running preRender(): ' + result.error);
          preRenderError.showTrace = false;
        }

        return !!result;
      }, hooksRetryTimeout, hooksRetryInterval, this.getError(`time out reached (${hooksRetryTimeout}ms) while waiting for component to mount.`))

      // run the play() function
      .execute(function(innerHTML) {
        var scriptTag = Object.assign(document.createElement('script'), {
          type: 'module',
          innerHTML
        });
        document.body.appendChild(scriptTag);
      }, [`
        const Component = window['@component_class'];
        if (Component && (typeof Component.play == 'function')) {
          try {
            window['@@playfn_result'] = await Component.play({
              args: window['@@component_props'],
              component: window['@@component_element'],
              canvasElement: window['@@canvas_element']
            }) || {};
          } catch (err) {
            console.error('Error while executing .play() function:', err);
            window.__$$PlayFnError = err;
          }
        }
        window.__$$PlayFnDone = true;
      `]);

    if (this.client.argv.debug) {
      await this.api.debug();
    } else if (this.client.argv.preview) {
      await this.api.pause();
    } else {
      await this.api.pause(500);
    }

    // waiting for play function to complete
    const result = await this.api.waitUntil(async function () {
      const result = await this.execute(function() {
        return window.__$$PlayFnDone === true;
      });

      return result;
    }, playFnTimeout, playFnRetryInterval, `time out reached (${playFnTimeout}ms) while waiting for the play() function to complete.`)

    // checking for errors in the play function
      .executeAsync(function (done) {
        setTimeout(function() {
          if (window.__$$NightwatchDescribe) {
            return done('DescribeError');
          }

          if (window.__$$PlayFnError) {
            return done('Error in .play() function: ' + window.__$$PlayFnError.message);
          }

          done('');
        }, 500);
      }, [], function(result) {
        if (result && result.value === 'DescribeError') {
          const err = new Error('Writing describe in JSX tests is not supported yet.');
          err.link = 'https://nightwatchjs.org/guide/';
          err.showTrace = false;

          throw err;
        }

        if (result && result.value !== '') {
          const err = new Error(result.value);
          err.showTrace = false;

          throw err;
        }
      })

      // run the postRender()
      .execute(function(innerHTML) {
        var scriptTag = Object.assign(document.createElement('script'), {
          type: 'module',
          innerHTML
        });
        document.body.appendChild(scriptTag);
      }, [`
        const Component = window['@component_class'];
        window.__$$AfterMountDone = false;
        window.__$$AfterMountError = null;
        if (Component && typeof Component.postRender == 'function') {
          try {
            await Component.postRender();
          } catch (err) {
            window.__$$AfterMountError = err.stack;
            throw new Error('Error while running postRender(): ' + err.stack);
          }
        }
        window.__$$AfterMountDone = true;
      `])

      // waiting for postRender hook to complete
      .waitUntil(async () => {
        const result = await this.api.execute(function() {
          if (window.__$$AfterMountError) {
            return window.__$$AfterMountError;
          }

          return window.__$$AfterMountDone === true;
        });

        if (typeof result == 'string') {
          postRenderError = new Error('Error while running postRender(): ' + result);
          postRenderError.showTrace = false;

          return true;
        }

        return result === true;
      }, hooksRetryTimeout, hooksRetryInterval, `time out reached (${hooksRetryTimeout}ms) while waiting for postRender() hook to complete.`)

      // get the command result
      .executeAsyncScript(function (rootElementId, done) {
        setTimeout(function() {
          var canvas = document.getElementById(rootElementId);
          var browserResult = {
            element: canvas ? canvas.firstElementChild : null,
            result: window['@@playfn_result']
          };
          done(browserResult);
        }, 100);
      }, [Command.rootElementId]);
   
    if (!result || preRenderError || postRenderError) {
      const err = this.getError('Could not mount the component.');
      if (preRenderError) {
        err.detailedErr = preRenderError.message;
      } else if (postRenderError) {
        err.detailedErr = postRenderError.message;
        err.message = 'Component mounted with errors';
      }

      return err;
    }

    const element = this.api.createElement(result.element, {
      isComponent: true,
      type: 'react'
    });

    const playFnResult = result.result;

    onInstanceAvailable(element);

    if (!isJSX) {
      return element;
    }

    return {
      element,
      result: playFnResult
    };
  }

  static _getReactImports() {
    const {version} = require(path.resolve('node_modules', 'react'));
    const reactDOMSuffix = version.startsWith('18') ? '/client': '';

    return `
      import * as React from 'react';
      import * as ReactDOM from "react-dom${reactDOMSuffix}";
    `;
  }

  /**
   * Provides the `render` method to the `ReactDOM`
   * if user uses the new Rendering API.
   *
   * @private
   * @returns {string}
   */
  static _unifyReactDOM() {
    return `
      const renderReactElement = 'createRoot' in ReactDOM
        ? (element, container) =>
            ReactDOM
              .createRoot(container)
              .render(element)
        : ReactDOM.render;
    `;
  }

  static _createIndexImport() {
    if (fs.existsSync(path.resolve('./nightwatch/index.jsx'))) {
      return 'import "/nightwatch/index.jsx";';
    }

    if (fs.existsSync(path.resolve('./nightwatch/index.tsx'))) {
      return 'import "/nightwatch/index.tsx";';
    }

    return '';
  }
  /**
   * Creates an import statement based on the type of the _component_.
   *
   * @param {string|object} component
   * @returns {string}
   */
  static _createComponentImport(component) {
    if (typeof component === 'string') {
      return `import Component from '${component}';`;
    }

    if (typeof component === 'object') {
      return `import ${
        component.exportName !== 'default' ? '_csfDescription,': ''
      } { ${
        component.exportName || 'default'
      } as Component } from '${component.path}';`;
    }

    return `const Component = ${component.toString()};`;
  }

  static _addDescribeMocks(isJSX) {
    if (!isJSX) {
      return '';
    }

    return 'import "/node_modules/vite-plugin-nightwatch/nightwatch/describe.js";';
  }

  /**
   * Merges common arguments, component arguments and inline props into one
   * object that will be passed to the `React.createElement`.
   *
   * @param {object|(() => object)} props
   * @returns {string}
   */
  static _createProps(props = {}) {
    const propsToInsert = typeof props === 'function' ? `(${props.toString()})()` : JSON.stringify(props);

    return `
			const isComponentDefaultExported = typeof _csfDescription === 'undefined';
			
			const commonArgs = isComponentDefaultExported ? {} : (_csfDescription.args || {});
			const componentArgs = Component.args || {};
      const inlineProps = ${propsToInsert} || {};
      
      const props = { ...commonArgs, ...componentArgs, ...inlineProps };
		`;
  }

  static _buildScript(Component, props, isJSX) {
    return `
      // THIS IS GENERATED FILE. DO NOT EDIT IT!
      // THIS FILE SHOULD NOT BE ADDED TO THE VERSION CONTROL SYSTEM.

      ${Command._getReactImports()}
      ${Command._addDescribeMocks(isJSX)}
      
      ${Command._createComponentImport(Component)}
      ${Command._createIndexImport()}
           
      ${Command._unifyReactDOM()}
      ${Command._createProps(props)}
      
      window.__$$BeforeMountError = false;
      if (typeof Component.preRender == 'function') {
        try {
          await Component.preRender();
        } catch (err) {
          window.__$$BeforeMountError = err.stack;
          throw new Error('Error while running preRender(): ' + err.stack);
        }
      }
      
      const element = React.createElement(Component, props);
      const canvasElement = document.getElementById('${Command.rootElementId}');
      renderReactElement(element, canvasElement);
      
      window.__nightwatch = {};
       
      window['@component_class'] = Component;
      window['@component_element'] = element;
      window['@@component_props'] = props;
      window['@@canvas_element'] = canvasElement;
      window['@@playfn_result'] = null;
      window.__$$PlayFnError = null;
      window.__$$PlayFnDone = false;         
    `;
  }

  /**
   * Creates a content for the script that will load component and mount
   * it into the renderer's canvas. For that purpose the file will be created
   * in the current working directory. That file has to be deleted after a testing is done.
   *
   * @param {string|ComponentDescription|(() => JSX.Element)} componentOrName
   * @param {object} [props]
   * @param {string} fileName
   * @param {boolean} isJSX
   * @returns {Promise<void>}
   */
  static _createEntryScriptFile({componentOrName, props, fileName, isJSX}) {
    const content = Command._buildScript(componentOrName, props, isJSX);

    return writeTmpTestFile({content, fileName});
  }
};
