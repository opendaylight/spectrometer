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
 * React component to display Recent activity in git
 * Used in /home page
 * Uses CardLayout
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react';
import {connect} from 'react-redux';

import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'
import CardLayout from '../card-layout'

export default class TrendCard extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const recentCommits = DataReducers.recentCommits(this.props.projects)

    return (
      <CardLayout id="trend" title="Recently" className="card--fit"
        avatar={<Avatar icon={<FontIcon className="material-icons">trending_up</FontIcon>} size={30}></Avatar>}>
        <List>
          {
            _.map(recentCommits, (x, index) => {
              return (!_.isEmpty(x.commits) && <ListItem key={`${x.name}-${index}`}
                primaryText={`${x.commits[0].author} committed ${moment(x.commits[0].authored_date).fromNow()}`}
                secondaryText={`${x.name}`}
                leftAvatar={<Avatar icon={<FontIcon className="material-icons">perm_identity</FontIcon>} size={30}></Avatar>} />)
            })
          }
        </List>
      </CardLayout>
    )
  }
}

TrendCard.propTypes = {
  projects: React.PropTypes.array.isRequired,
}
