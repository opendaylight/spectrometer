import { createStore, applyMiddleware, compose } from 'redux';

import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
// import promiseMiddleware from './api/promiseMiddleware';

import rootReducer from './reducers';

const buildStore = (state) => {

  let middlewareList = [thunk]; //,promiseMiddleware];

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

// const finalCreateStore = compose(...middlewareBuilder())(createStore);

export default function configureStore(initialState) {
  // const store = finalCreateStore(rootReducer, initialState);
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
