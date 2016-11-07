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
 * React component to display Timeline of commits Card
 * Used in /home page
 * Uses CardLayout
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'

import CardLayout from '../card-layout'
import TimeVsProjectsChart from '../charts/time-vs-projects-chart'
import TimeVsCommitsChart from '../charts/time-vs-commits-chart'

const buttonActions = [
  {type: 'chart', option: 'projects', icon: 'timeline', tooltip: 'New Project Engagement by Timeline'},
  {type: 'chart', option: 'commits', icon: 'code', tooltip: 'Commits By Timeline'}
]

export default class TimelineCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'commits'
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    logger.info("timeline-card:render", this.state.view)

    const { projects, ...props } = this.props
    return (
      <CardLayout id="timeline-card" title="Timelines" className="card--full-width"
        avatar={<Avatar icon={<FontIcon className="material-icons">timeline</FontIcon>} size={30}></Avatar>}
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chart === 'projects' && <TimeVsProjectsChart projects={projects}/> }
        {this.state.view.chart === 'commits' && <TimeVsCommitsChart projects={projects}/> }
      </CardLayout>
    )
  }
}

TimelineCard.propTypes = {
  projects: React.PropTypes.array
}
