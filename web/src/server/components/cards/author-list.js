import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react';

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';

import * as DataReducers from '../../api/data-reducers'
import MobileTearSheet from '../layouts/mobile-tear-sheet'

export default class AuthorList extends Component {
  constructor(props) {
    super(props)
  }

  handleOnTouchTap = (project) => {
    this.props.onClick(project)
  }

  render() {
    if (_.isEmpty(this.props.projects)) return (null)

    const authors = DataReducers.uniqueAuthorsForAllProjects(this.props.projects)

    const authorsList = () => (
      <MobileTearSheet>
        <List>
          {
            _.map(authors, x => {
              return (
                <ListItem key={x} primaryText={x} leftAvatar={<Avatar>{x.charAt(0)}</Avatar>}
                  onTouchTap={this.handleOnTouchTap.bind(this, x)}
                />
              )
            })
          }
        </List>
        <Divider />
      </MobileTearSheet>
    )

    return (
      authorsList()
    )
  }
}

AuthorList.propTypes = {
  projects: React.PropTypes.array.isRequired,
  onClick: React.PropTypes.func.isRequired
}
