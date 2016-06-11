import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react';

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';

import * as DataReducers from '../../api/data-reducers'
import MobileTearSheet from '../layouts/mobile-tear-sheet'

export default class ProjectList extends Component {
  constructor(props) {
    super(props)
  }

  handleOnTouchTap = (project) => {
    this.props.onClick(project)
  }

  render() {
    const projectList = (projects) => (
      <MobileTearSheet>
        <List>
          {
            _.map(projects, x => {
              return (
                <ListItem key={x.name} primaryText={x.name} leftAvatar={<Avatar>{x.name.charAt(0)}</Avatar>}
                  onTouchTap={this.handleOnTouchTap.bind(this, x.name)}
                />
              )
            })
          }
        </List>
        <Divider />
      </MobileTearSheet>
    )

    if (_.isEmpty(this.props.projects)) return (null)
    return (
      projectList(_.filter(this.props.projects, p => p.ref1 === 'master' && p.ref2 === 'master'))
    )
  }
}

ProjectList.propTypes = {
  projects: React.PropTypes.array.isRequired,
  onClick: React.PropTypes.func.isRequired
}
