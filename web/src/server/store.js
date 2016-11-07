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

/**
 * Redux Store
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import { createStore, applyMiddleware, compose } from 'redux';

import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import rootReducer from './reducers';

const buildStore = (state) => {

  let middlewareList = [thunk];

  if (process.browser && process.env.NODE_ENV !== 'production') {
    middlewareList.push(createLogger())
  }
  let appliedMiddlewareList = []
  appliedMiddlewareList.push(applyMiddleware(...middlewareList))
  if (process.browser && process.env.NODE_ENV !== 'production') {
    const DevTools = require('./utils/devtools').default;
    appliedMiddlewareList.push(DevTools.instrument());
  }

  return createStore(rootReducer,state,compose(...appliedMiddlewareList));
}

export default function configureStore(initialState) {
  const store = buildStore(initialState);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
