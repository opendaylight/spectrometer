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
 * Spectrometer application boot up page
 * - includes babel and polyfill for on-the-fly transpilation
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

require('babel-register')({
  ignore: function(filename) {
    return filename.indexOf('/node_modules/') >= 0;
  }
});
require('babel-polyfill')

// Startup the NodeJS server
require('./server');
