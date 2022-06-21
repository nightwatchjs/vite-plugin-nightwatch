import {createRoot} from 'react-dom/client';
import {createElement} from 'react';

export default {
    React: { createElement },
    ReactDOM: {
        render(element, container) {
            return createRoot(container).render(element);
        }
    }
}