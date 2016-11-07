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
 * React component to display Contributor charts
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

import ProjectsVsAuthorsChart from '../charts/projects-vs-authors-chart'
import ProjectsVsOrganizationsChart from '../charts/projects-vs-organizations-chart'
import OrganizationsVsAuthorsChart from '../charts/organizations-vs-authors-chart'

const TOP_10 = require('../../../../config/spectrometer-web.json').top10

const buttonActions = [
  {type: 'chart', option: 'organization-vs-authors', icon: 'business', tooltip: 'Show # of authors per organization'},
  {type: 'chart', option: 'projects-vs-organizations', icon: 'folder_open', tooltip: 'Show # of organizations contributing per project'},
  {type: 'chart', option: 'projects-vs-authors', icon: 'folder_shared', tooltip: 'Show # of authors contributing per project'}
]

export default class ContributorsCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'organization-vs-authors'
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    const { projects, ...props } = this.props

    return (
      <CardLayout id="contributors" title="contributors" className="card--full-width"
        avatar={<Avatar icon={<FontIcon className="material-icons">folder</FontIcon>} size={30}></Avatar>}
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chart === 'projects-vs-authors' && <ProjectsVsAuthorsChart projects={projects} view={{takeRight: TOP_10}}/>}
        {this.state.view.chart === 'projects-vs-organizations' && <ProjectsVsOrganizationsChart projects={projects} view={{takeRight: TOP_10}}/>}
        {this.state.view.chart === 'organization-vs-authors' && <OrganizationsVsAuthorsChart projects={this.props.projects} view={{takeRight: TOP_10}}/>}
      </CardLayout>
    )
  }
}

ContributorsCard.propTypes = {
  projects: React.PropTypes.array
}
