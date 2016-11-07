/**
# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2016 The Linux Foundation and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################
*/



import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import injectTapEventPlugin from 'react-tap-event-plugin';

import configureStore from '../server/store';
import routes from '../server/routes';

require('../../assets/images/favicon.ico')
window.logger = global.logger || require('../server/logger')

logger.info("starting OpenDaylight Spectrometer client")

injectTapEventPlugin()

const initialState = window.__INITIAL_STATE__
const store = configureStore(initialState)
const history = syncHistoryWithStore(browserHistory,store)
const rootElement = document.getElementById('spectrometer')

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      { routes }
    </Router>
  </Provider>,
  document.getElementById('spectrometer')
);

if (process.env.NODE_ENV !== 'production') {
  // Don't change this to an import, it needs to be in the
  // conditional as a require so it gets stripped out of
  // production builds by webpack
  const DevTools = require('../server/utils/devtools').default;
  const devNode = document.createElement('div');
  document.body.appendChild(devNode);
  ReactDOM.render(<DevTools store={store} />,devNode);
}
