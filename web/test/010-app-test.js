import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, createMemoryHistory } from 'react-router';

import TestUtils from 'react-addons-test-utils';

import TestUtilsAdditions from 'react-testutils-additions';
import expect from 'expect';

import configureStore from '../src/server/store';

import App from '../src/server/components/App';

describe('app suite:', function(){

  before('render app component', function() {
    const c0 = require('./fixtures/commits-spectrometer')
    const store = configureStore({
      projects: [{ name: 'spectrometer', commits: c0.commits }]
    });

    const renderedComponent = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Router history={createMemoryHistory('/')}>
          <Route path='/' component={App}/>
        </Router>
      </Provider>);

    this.wrapper = TestUtilsAdditions.findRenderedDOMComponentWithId( renderedComponent, 'opendaylight-spectrometer' );
  });

  it('app with id opendaylight-spectrometer should exist', function() {
    expect(this.wrapper).toExist();
  });
});
