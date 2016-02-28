import 'babel-core/register';
import ReactDOM from 'react-dom';
import React from 'react';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'

import configureStore from '../common/store/configureStore';
import routes from '../common/routes';

import "../../styles/index.css";

const history = createBrowserHistory();
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);
const rootElement = document.getElementById('root');

ReactDOM.render(
  <Provider store={store}>
        <ReduxRouter>
          <Router children={routes} history={history} />
        </ReduxRouter>
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
  const DevTools = require('../common/utils/DevTools').default;
  const devNode = document.createElement('div');
  document.body.appendChild(devNode);
  ReactDOM.render(<DevTools store={store} />,devNode);
}
