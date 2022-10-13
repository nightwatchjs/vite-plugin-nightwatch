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
