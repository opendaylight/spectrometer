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
 * React component to Branch Slider
 * Used in ProjectsCard
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import React, { Component } from 'react'

const Slider = require('rc-slider');

import * as Branches from '../api/branches'

const branchLabels = (branchActions) => {
  let map = {}
  _.each(Branches.BranchMap, (x, i) => {
    map[i] = {
      style: {
        color: _.find(branchActions, y => y.code === x.code).enabled ? '#E65100' : 'lightgrey'
      },
      label: <strong>{x.code}</strong>
    }
  })
  return map
}

const tooltipFormatter = (value) => {
  return Branches.findBranchNameByIndex(value)
}

export default class BranchSlider extends Component {
  constructor(props) {
    super(props)
    this.handleOnChange = this.handleOnChange.bind(this)
  }

  handleOnChange = (value) => {
    this.props.handleOnChange(value)
  }

  render() {
    const labels = branchLabels(this.props.branchActions)
    return (
      <div>
        <div className="branch-slider">
          <Slider range dots min={0} max={5} marks={labels} step={1} defaultValue={[0,0]}
            onChange={this.handleOnChange}
            allowCross={false}
            tipFormatter={tooltipFormatter}
            tipTransitionName="rc-slider-tooltip-zoom-down"
          />
        </div>
      </div>
    )
  }
}

BranchSlider.propTypes = {
  branchActions: React.PropTypes.array.isRequired,
  handleOnChange: React.PropTypes.func.isRequired
}
