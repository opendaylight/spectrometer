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
 * React component to display Hints like Atom IDE style
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'

import React, { Component } from 'react'

const hints = require('../../../config/spectrometer-web.json').hints

const randomInt = (min, max) => { return Math.floor(Math.random() * (max - min + 1)) + min }

export default class Hints extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: _.filter(hints, x => x.type === props.type || x.type === 'all'),
      randomIndex: 0,
      hintTimeout: undefined
    }
    this.update = this.update.bind(this)
  }

  componentDidMount() {
    this.update()
  }

  update() {
    this.setState({
      randomIndex: randomInt(0, this.state.items.length-1)
    })
    this.state.hintTimeout = setTimeout(this.update, 15000)
  }

  componentWillUnmount() {
    clearTimeout(this.state.hintTimeout)
  }

  render() {
    const hintItem = this.state.items[this.state.randomIndex]
    const lines = hintItem.text.split('\n')
    return (
      <div className="hint animated fadeIn">
        {
          _.map(lines, (x, index) => {
            return (<div id={`${hintItem.type}-${index}`} key={`${hintItem.type}-${index}`} className="hint--line">{x}</div>)
          })
        }
      </div>
    )
  }
}

Hints.propTypes = {
  type: React.PropTypes.string
}
