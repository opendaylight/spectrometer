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
 * React component to display CardLayout
 * Uses Paper material-ui
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'

import React, { Component } from 'react';
import Paper from 'material-ui/Paper';

import BranchSlider from './branch-slider'

export default class CardLayout extends Component {

  handleOnClose() {
    if (this.props.handleOnClose) this.props.handleOnClose()
  }

  handleButtonActions(type, option) {
    this.props.handleButtonActions(type, option)
  }

  handleBranchActions = (value) => {
    this.props.handleBranchActions(value)
  }

  render() {
    const { id, className, style, zDepth, ...props } = this.props;
    return (
      <Paper id={id} zDepth={zDepth} className={`animated flipX card ${className}`} style={style}>
        <div className={`card--header ${props.headerClassName}`} >
          {props.avatar}
          <span className={`card--title ${props.titleClassName}`}>{this.props.title}</span>
          {props.handleOnClose && <span className="card-button material-icons" onClick={this.handleOnClose.bind(this)}>close</span>}
          {_.map(props.buttonActions, (button) => {
            let clazz = 'card-button material-icons'
            clazz += this.props.currentView[button.type] === button.option ? ' selected' : ''
            clazz += button.group ? ' group' : ''
            return (
              <a key={`${props.id}-${button.type}-${button.option}`} className={clazz} title={button.tooltip}
                onClick={this.handleButtonActions.bind(this, button.type, button.option)}>{button.icon}
              </a>)
          })}
        </div>
        {props.branchActions &&
          <Paper zDepth={1} className='card-branches animated flipX'>
            <BranchSlider branchActions={props.branchActions} handleOnChange={this.handleBranchActions}/>
          </Paper> }
        {this.props.children}
      </Paper>
    )
  }
}

CardLayout.defaultProps = {
  title: 'Card',
  currentView: {},
  buttonActions: [],
  zDepth: 1,
  className: '',
  headerClassName: '',
  titleClassName: ''
}

CardLayout.propTyes = {
  id: React.PropTypes.string.isRequired,
  zDepth: React.PropTypes.number,
  avatar: React.PropTypes.object,
  title: React.PropTypes.string.isRequired,
  className: React.PropTypes.string,
  headerClassName: React.PropTypes.string,
  titleClassName: React.PropTypes.string,
  style: React.PropTypes.object,
  handleOnClose: React.PropTypes.func,
  buttonActions: React.PropTypes.array,
  handleButtonActions: React.PropTypes.func,
  branchActions: React.PropTypes.array,
  handleBranchActions: React.PropTypes.func,
  currentView: React.PropTypes.object
}
