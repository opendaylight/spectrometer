import _ from 'lodash'

import React, { Component } from 'react';
import Paper from 'material-ui/Paper';

export default class PaperLayout extends Component {

  handleOnClose() {
    if (this.props.handleOnClose) this.props.handleOnClose()
  }

  handleButtonActions(type, option) {
    this.props.handleButtonActions(type, option)
  }

  handleBranchActions(type, option) {
    this.props.handleBranchActions(type, option)
  }

  render() {
    const { className, style, zDepth, ...props } = this.props;
    return (
      <Paper zDepth={props.zDepth} className={className + ' animated fadeIn'} style={style}>
        <div className="paper-header">
          {props.avatar}
          <span className={'paper-title ' + (props.titleClassName || '')}>{this.props.title}</span>
          {props.handleOnClose && <span className="paper-header-button material-icons" onClick={this.handleOnClose.bind(this)}>close</span>}
          {_.map(props.buttonActions, (button) => {
            let clazz = 'paper-header-button material-icons'
            clazz += this.props.currentView[button.type] === button.option ? ' selected' : ''
            clazz += button.group ? ' group' : ''
            return (
              <span key={`${props.id}-${button.type}-${button.option}`} className={clazz} title={button.tooltip}
                onClick={this.handleButtonActions.bind(this, button.type, button.option)}>{button.icon}
              </span>)
          })}
        </div>
        {props.branchActions && <Paper zDepth={1} className='paper-header-branches animated flipX'>
          {_.map(props.branchActions, (button) => {
            let clazz = 'paper-header-button branch'
            clazz += (this.props.currentView.ref1 === button.name) ? ' selected-ref1' : (this.props.currentView.ref2 === button.name) ? ' selected-ref2' : ''
            clazz += button.enabled ? '' : ' disabled'
            return (
              <span key={`${props.id}-${button.code}`} className={clazz} title={button.tooltip}
                onClick={button.enabled ? this.handleBranchActions.bind(this, button.name) : null}>{button.code}
              </span>)
          })}
        </Paper>}
        {this.props.children}
      </Paper>
    )
  }
}

PaperLayout.defaultProps = {
  zDepth: 0,
  title: 'A Card',
  currentView: {},
  buttonActions: []
}

PaperLayout.propTyes = {
  id: React.PropTypes.string.isRequired,
  zDepth: React.PropTypes.number,
  avatar: React.PropTypes.object,
  title: React.PropTypes.string.isRequired,
  titleClassName: React.PropTypes.string,
  className: React.PropTypes.string,
  style: React.PropTypes.object,
  handleOnClose: React.PropTypes.func,
  buttonActions: React.PropTypes.array,
  handleButtonActions: React.PropTypes.func,
  branchActions: React.PropTypes.array,
  handleBranchActions: React.PropTypes.func,
  currentView: React.PropTypes.object
}
