/*
@License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
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
 * Reads git branch meta data from a config file
 * Provides utility functions to find branch by name or chronological sequence (index)
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'

export const BranchMap = require('../../../config/spectrometer-web.json').branches

const BranchIndexMap = {}

/**
 * create a Branch index map of chronological sequence of Branches
 * @singleton function
 * @returns [{0: M, 1: B, 2: Be, 3: Li, ...}]
 */
const branchSequence = () => {
  if (!_.isEmpty(BranchIndexMap)) return BranchIndexMap

  _.each(BranchMap, (x, i) => {
    BranchIndexMap[i] = x.code
  })
  return BranchIndexMap
}

/**
 * find the branch name, given the code
 * @param code = M, B, Be etc.
 * @returns master, stable/boron, stable/beryllium etc.
 */
export function findBranchNameByCode(code) {
  return _.find(BranchMap, x => x.code === code).name
}

/**
 * find the branch name, given the index
 * @param index = 0 (Master), 1 (Boron), ...
 * @returns master, stable/boron, stable/beryllium etc.
 */
export function findBranchNameByIndex(index) {
  return findBranchNameByCode(branchSequence()[index])
}
