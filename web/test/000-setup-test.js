require('babel-register')( { ignore: [ "node_modules" ] });
require('babel-polyfill');

// Ensure a DOM is present for React component tests
var jsdom = require('jsdom');

global.document = jsdom.jsdom('<!DOCTYPE html><html><body></body></html>');
global.window = document.defaultView;
global.window.location.href = 'http://localhost';
global.navigator = { navigator: 'all', userAgent: 'Chrome' };
process.env.NODE_ENV = 'test';
process.browser = true;

console.json = (msg, data) => {
  console.info(msg + '\n' + JSON.stringify(data, undefined, 2));
}

console.debug = (msg, data) => {
  console.info(msg, data);
}

console.log('starting opendaylight-spectrometer web test suites...')
