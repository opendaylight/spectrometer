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
import { Router, Route, createMemoryHistory } from 'react-router';

import TestUtils from 'react-addons-test-utils';

import TestUtilsAdditions from 'react-testutils-additions';
import expect from 'expect';

import configureStore from '../src/server/store';

import App from '../src/server/components/app';

describe('app suite:', function(){

  before('render app component', function() {
    const c0 = require('./fixtures/commits-spectrometer')
    const store = configureStore({
      spectro: { projects: [{ name: 'spectrometer', commits: c0.commits }] }
    });

    const renderedComponent = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Router history={createMemoryHistory('/')}>
          <Route path='/' component={App}/>
        </Router>
      </Provider>);

    this.wrapper = TestUtilsAdditions.findRenderedDOMComponentWithId( renderedComponent, 'opendaylight-spectrometer-main' );
  });

  it('app with id #odls-main should exist', function() {
    expect(this.wrapper).toExist();
  });
});
