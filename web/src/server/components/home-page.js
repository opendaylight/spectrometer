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
 * React component to display Home Page
 * Used by routes.js to goto /home url
 * Displays Top10, Timeline, Contributors, Community and Trend cards
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react';
import {connect} from 'react-redux';

import {Tabs, Tab} from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import * as DataReducers from '../api/data-reducers'

import Top10Card from './cards/top10-card'
import TimelineCard from './cards/timeline-card'
import ContributorsCard from './cards/contributors-card'
import CommunityCard from './cards/community-card'
import TrendCard from './cards/trend-card'

@connect(state => ({
  projects: state.spectro.projects
}))
export default class HomePage extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    if (!process.browser || _.isEmpty(this.props.projects)) return null

    const master = DataReducers.filterMasterProjects(this.props.projects)
    logger.info("HomePage:Projects Count:", master ? master.length : 0)

    return (
      <div id="home-page" className="page-content">
        <div id="panel-left-graphs" className="page-content-left">
          <Top10Card projects={master} />
          <TimelineCard projects={master} />
          <ContributorsCard projects={master} />
        </div>
        <div id="panel-right-info" className="page-content-right">
          <CommunityCard projects={master} />
          <TrendCard projects={master} />
        </div>
      </div>
    )
  }
}
