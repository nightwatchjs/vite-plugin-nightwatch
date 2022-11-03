const reactScript = (path) =>
  `
		import '/node_modules/react/umd/react.development.js';
		import '/node_modules/react-dom/umd/react-dom.development.js';
      
		import Component from '${path}';
		
		const renderReactElement = 'createRoot' in ReactDOM
			? (element, container) =>
					ReactDOM
						.createRoot(container)
						.render(element)
			: ReactDOM.render;
			
		const props = Component.args || {};
		
		const element = React.createElement(Component, props);
		
		const canvasElement = document.getElementById('app');
		
		renderReactElement(element, canvasElement);
		
		window['@component_class'] = Component;
    window['@component_element'] = element;
	`;

const vueScript = (path) =>
  `
		import {mount} from '/node_modules/@vue/test-utils/dist/vue-test-utils.esm-browser.js';
		import Component from '${path}';
		
		const element = mount(Component, {
		 attachTo: document.getElementById('app'),
		 global: {}
		});
		
		window['@component_element'] = element;
		window['@component_class'] = Component;
	`;

module.exports = function (content, componentType, path) {
  return content.replace(
    '<!-- script -->',
    `<script type="module">
			${componentType === 'react' ? reactScript(path) : vueScript(path)}
		</script>`
  );
};
