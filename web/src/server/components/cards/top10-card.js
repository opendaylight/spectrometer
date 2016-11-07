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
 * React component to display Top10 contributions of Authors, Projects, Organizations and Summary
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
import AuthorsVsCommitsChart from '../charts/authors-vs-commits-chart'
import OrganizationsVsCommitsChart from '../charts/organizations-vs-commits-chart'
import ProjectsVsCommitsChart from '../charts/projects-vs-commits-chart'

const TOP_10 = require('../../../../config/spectrometer-web.json').top10

const buttonActions = [
  {type: 'chart', option: 'organizations-vs-commits', icon: 'business', tooltip: 'Organizations vs Commits'},
  {type: 'chart', option: 'projects-vs-commits', icon: 'folder', tooltip: 'Projects vs Commits'},
  {type: 'chart', option: 'authors-vs-commits', icon: 'people', tooltip: 'Authors vs Commits'},
  {type: 'chart', option: 'summary', icon: 'assignment', tooltip: 'Summary'}
]

const renderAuthorSummary = (projects) => {
  const commitCountArray = DataReducers.authorsVsCommitCount(projects)
  const c0 = DataReducers.mostAndLeast(commitCountArray, 'commitCount')
  const c1 = DataReducers.mostAndLeast(commitCountArray, 'loc')
  return (
    <div>
      <p>
        <span className="text-author">{c0.most1.name}</span>
        <span> is the most active author by number of commits</span>
        <span className="text-commits"> ({c0.most1.commitCount})</span>
        <span> followed by </span>
        <span className="text-author">{c0.most2.name}</span>
        <span className="text-commits"> ({c0.most2.commitCount})</span>
      </p>
      <p>
        <span className="text-author">{c1.most1.name}</span>
        <span> is the most active author by lines of code modified</span>
        <span className="text-loc"> ({c1.most1.loc})</span>
        <span> followed by </span>
        <span className="text-author">{c1.most2.name}</span>
        <span className="text-loc"> ({c1.most2.loc})</span>
      </p>
    </div>
  )
}

const renderOrgSummary = (projects) => {
  const commitCountArray = DataReducers.organizationsVsCommitCount(projects)
  const c0 = DataReducers.mostAndLeast(commitCountArray, 'commitCount')
  const authorCountArray = DataReducers.organizationsVsAuthorsCountForAllProjects(projects)
  const a0 = DataReducers.mostAndLeast(authorCountArray, 'authorCount')
  return (
    <div>
      <p>
        <span className="text-organization">{c0.most1.name}</span>
        <span> is the most active organization by number of commits</span>
        <span className="text-commits"> ({c0.most1.commitCount})</span>
        <span> followed by </span>
        <span className="text-organization">{c0.most2.name}</span>
        <span className="text-commits"> ({c0.most2.commitCount})</span>
      </p>
      <p>
        <span className="text-organization">{a0.most1.name}</span>
        <span> is the most active organization by number of authors contributing</span>
        <span className="text-author"> ({a0.most1.authorCount})</span>
        <span> followed by </span>
        <span className="text-organization">{a0.most2.name}</span>
        <span className="text-commits"> ({a0.most2.authorCount})</span>
      </p>
    </div>
  )
}

const renderProjectSummary = (projects) => {
  const pc0 = DataReducers.projectsVsCommitCount(projects)
  const c0 = DataReducers.mostAndLeast(pc0, 'commitCount') //most and least commits by count
  const loc0 = DataReducers.mostAndLeast(pc0, 'loc') //most and least by loc

  return (
    <div>
      <p>
        <span className="text-project">{c0.most1.name}</span>
        <span> is the most active project by number of commits</span>
        <span className="text-commits"> ({c0.most1.commitCount})</span>
        <span> followed by </span>
        <span className="text-project">{c0.most2.name}</span>
        <span className="text-commits"> ({c0.most2.commitCount})</span>
      </p>
      <p>
        <span className="text-project">{loc0.most1.name}</span>
        <span> is the most active project by number of lines of code modified</span>
        <span className="text-loc"> ({loc0.most1.loc})</span>
        <span> followed by </span>
        <span className="text-project">{loc0.most2.name}</span>
        <span className="text-loc"> ({loc0.most2.loc})</span>
      </p>
    </div>
  )
}

const renderSummary = (projects) => {
  return (
    <div  className="card-summary">
      {renderAuthorSummary(projects)}
      {renderOrgSummary(projects)}
      {renderProjectSummary(projects)}
    </div>
  )
}

export default class Top10Card extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'authors-vs-commits'
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    const { projects, ...props } = this.props
    logger.info("top10-card:render", this.state.view)

    return (
      <CardLayout id="top10-card" title="Overview" className="card--full-width"
        avatar={<Avatar icon={<FontIcon className="material-icons">folder</FontIcon>} size={30}></Avatar>}
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chart === 'authors-vs-commits' && <AuthorsVsCommitsChart projects={projects} view={{takeRight: TOP_10}}  />}
        {this.state.view.chart === 'organizations-vs-commits' && <OrganizationsVsCommitsChart projects={projects} view={{takeRight: TOP_10}} />}
        {this.state.view.chart === 'projects-vs-commits' && <ProjectsVsCommitsChart projects={projects} view={{takeRight: TOP_10}} />}
        {this.state.view.chart === 'summary' && renderSummary(projects)}
      </CardLayout>
    )
  }
}

Top10Card.propTypes = {
  projects: React.PropTypes.array,
  className: React.PropTypes.string
}
