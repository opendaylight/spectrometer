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
 * Shared Utilities
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'
import moment from 'moment'

/**
 * converts time to MMM-YYYY format for better display in the graphs
 * @returns string, date in MMM-YYYY format
 */
export function toMonthYearFormat(time, timezone) {
  const k = moment(time)
  return k.format('MMM')+'-'+k.year()
}

/**
 * parses the project url to find the project name using regex
 * @param url http://$apiServerUrl/git/...?project=aaa
 * @returns string, project name, eg: aaa
 */
export function parseProjectFromUrl(url) {
  return url.match(/.*project=(.*)/)[1]
}
