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
 * Global Logger
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

var logger = require('loglevel')
var logtimestamp = require('loglevel-timestamp')

logger.setLevel(0)
logtimestamp(logger, {shouldTimestamp: true, shouldLevel: true})

global.logger = logger

module.exports = logger
