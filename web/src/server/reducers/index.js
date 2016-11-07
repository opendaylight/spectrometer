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
 * Redux master reducer
 * All projects related info is grouped under "spectro" Key
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import reducer from '../git-stats/git-stats'

export default combineReducers({
  version: '0.1',
  spectro: reducer,
  routing : routerReducer
});
