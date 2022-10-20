import React, {version} from 'react';
let ReactDOM;
if(version.startsWith('18')) {
  ReactDOM = await import('react-dom/client');
} else {
  ReactDOM = await import('react-dom'); 
}


export default {
  ReactDOM,
  React
}