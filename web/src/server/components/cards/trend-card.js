import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react';
import {connect} from 'react-redux';

import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

export default class TrendCard extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const recentCommits = DataReducers.recentActivitiesForAllProjects(this.props.projects)
    // console.log("TrendCard:render", recentCommits)
    return (
      <PaperLayout id="trend" title="Recently" titleClassName="recently"
        avatar={<Avatar icon={<FontIcon className="material-icons">trending_up</FontIcon>} size={30}></Avatar>}>
        <List>
          {
            _.map(recentCommits, (x, index) => {
              return (!_.isEmpty(x.commits) && <ListItem key={`${x.name}-${index}`}
                primaryText={`${x.commits[0].author} committed ${moment(x.commits[0].authored_date*1000).fromNow()}`}
                secondaryText={`${x.name}`}
                leftAvatar={<Avatar icon={<FontIcon className="material-icons">perm_identity</FontIcon>} size={30}></Avatar>} />)
            })
          }
        </List>
      </PaperLayout>
    )
  }
}

TrendCard.propTypes = {
  projects: React.PropTypes.array.isRequired,
}
