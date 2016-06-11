// import 'babel-register';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import injectTapEventPlugin from 'react-tap-event-plugin';

import configureStore from '../server/store';
import routes from '../server/routes';

import "../../assets/styles/index.css";

console.log("starting OpenDaylight Spectrometer client")
injectTapEventPlugin()

const initialState = window.__INITIAL_STATE__
const store = configureStore(initialState)
const history = syncHistoryWithStore(browserHistory,store)
const rootElement = document.getElementById('root')

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      { routes }
    </Router>
  </Provider>,
  document.getElementById('root')
);

// if (process.env.NODE_ENV !== 'production') {
//   var devtools = require('../server/devtools');
//   devtools.default(store);
// }

if (process.env.NODE_ENV !== 'production') {
  // Don't change this to an import, it needs to be in the
  // conditional as a require so it gets stripped out of
  // production builds by webpack
  const DevTools = require('../server/utils/devtools').default;
  const devNode = document.createElement('div');
  document.body.appendChild(devNode);
  ReactDOM.render(<DevTools store={store} />,devNode);
}
