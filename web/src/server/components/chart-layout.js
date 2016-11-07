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
 * React component to display Charts in a layout
 * Uses Paper material-ui component
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'

import React, { Component } from 'react';
import Paper from 'material-ui/Paper';

export default class ChartLayout extends Component {

  handleButtonActions(type, option) {
    this.props.handleButtonActions(type, option)
  }

  render() {
    const { id, className, style, zDepth, ...props } = this.props;
    return (
      <Paper id={id} zDepth={zDepth} className={`animated flipX chart ${className}`} style={style}>
        <div className={`chart--header ${props.headerClassName}`} >
          <span className={`chart--title ${props.titleClassName}`}>{props.title}</span>
          {_.map(props.buttonActions, (button) => {
            let buttonClassName = 'card-button material-icons'
            buttonClassName += props.currentView[button.type] === button.option ? ' selected' : ''
            buttonClassName += button.group ? ' group' : ''
            return (
              <span key={`${props.id}-${button.type}-${button.option}`} className={buttonClassName} title={button.tooltip}
                onClick={this.handleButtonActions.bind(this, button.type, button.option)}>{button.icon}
              </span>)
          })}
        </div>
        {this.props.children}
      </Paper>
    )
  }
}

ChartLayout.defaultProps = {
  title: 'Chart',
  currentView: {},
  buttonActions: [],
  zDepth: 2,
  className: '',
  headerClassName: '',
  titleClassName: '',
  style: {}
}

ChartLayout.propTyes = {
  id: React.PropTypes.string.isRequired,
  zDepth: React.PropTypes.number,
  title: React.PropTypes.string.isRequired,
  className: React.PropTypes.string,
  headerClassName: React.PropTypes.string,
  titleClassName: React.PropTypes.string,
  style: React.PropTypes.object,
  buttonActions: React.PropTypes.array,
  handleButtonActions: React.PropTypes.func,
  currentView: React.PropTypes.object
}
