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
 * React component to display a single Author Card
 * Uses CardLayout to display the PaperLayout Material UI Card
 * Used in /authors page
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'
import {connect} from 'react-redux'

import Avatar from 'material-ui/Avatar'

import * as GitStats from '../../git-stats/git-stats'
import * as DataReducers from '../../api/data-reducers'

import CardLayout from '../card-layout'
import ProjectsVsCommitsChart from '../charts/projects-vs-commits-chart'
import TimeVsCommitsChart from '../charts/time-vs-commits-chart'

const TOP_10 = require('../../../../config/spectrometer-web.json').top10

const buttonActions = [
  {type: 'chart', option: 'time-vs-commits', icon: 'multiline_chart', tooltip: 'Timeline vs Commits Chart'},
  {type: 'chart', option: 'projects-vs-commits', icon: 'code', tooltip: 'Projects vs Commits Chart'},
  {type: 'chart', option: 'summary', icon: 'assignment', tooltip: 'Author Profile'}
]

const renderSummary = (projects, card) => {
  const a0 = DataReducers.projectsVsContributorCount(projects, {contributor: 'author', author: card.name})
  const authorCount = _.sumBy(a0, 'contributorCount')

  const p0 = DataReducers.projectsVsCommitCount(projects, {contributor: 'author', author: card.name})
  const commitCount = _.sumBy(p0, 'commitCount')
  const locCount = _.sumBy(p0, 'loc')

  const pc0 = DataReducers.projectsVsCommits(projects, {contributor: 'author', author: card.name})

  let commit1 = null, commit2 = null, project1 = null, project2 = null
  if (pc0.length > 0) {
    project1 = pc0[0]
    commit1 = (project1.commits.length > 0) ? project1.commits[0] : null
    project2 = pc0[pc0.length - 1]
    commit2 = (project2.commits.length > 0) ? project2.commits[project2.commits.length - 1] : null
  }

  return (
    <div className="card-summary">
      <p> <span className="text-email">{commit1.author_email}</span> </p>
      <p> <span className="text-project">{p0.length}</span><span> projects contributed </span> </p>
      <p> <span className="text-commits">{commitCount}</span><span> commits</span> </p>
      <p> <span className="text-loc">{locCount}</span><span> lines of code modified</span> </p>
      <p>
        {commit1 && <span><span>First committed on </span><span className="text-time">{moment(commit1.authored_date).format('DD-MMM-YYYY')}</span><span className="text-project"> ({project1.name})</span></span>}
      </p>
      <p>
        {commit2 && <span><span>Last committed on </span><span className="text-time">{moment(commit2.authored_date).format('DD-MMM-YYYY')}</span><span className="text-project"> ({project2.name})</span></span>}
      </p>
    </div>
  )
}

@connect(state => ({
  projects: state.spectro.projects
}))
export default class AuthorCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'summary'
      }
    }
  }

  handleOnClose(order) {
    this.props.handleOnClose(order)
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {

    if (_.isEmpty(this.props.card)) return (null)

    logger.info("author-card:render", this.props.card.name)
    return (
      <CardLayout id={`author-card-${this.props.card.name}-${this.props.card.index}`}
        title={this.props.card.name} avatar={this.props.avatar}
        handleOnClose={this.handleOnClose.bind(this, this.props.card.index)}
        buttonActions={buttonActions}
        handleButtonActions={this.handleButtonActions.bind(this)}
        currentView={this.state.view}>
        {this.state.view.chart === 'summary' && renderSummary(this.props.projects, this.props.card)}
        {this.state.view.chart === 'projects-vs-commits' && <ProjectsVsCommitsChart projects={this.props.projects} view={{ref1: 'master', ref2: 'master', author: this.props.card.name, takeRight: TOP_10}} />}
        {this.state.view.chart === 'time-vs-commits' && <TimeVsCommitsChart projects={this.props.projects} view={{ref1: 'master', ref2: 'master', contributor: 'author', author: this.props.card.name}} />}
      </CardLayout>
    )
  }
}

AuthorCard.propTypes = {
  card: React.PropTypes.object,
  handleOnClose: React.PropTypes.func,
  avatar: React.PropTypes.object
}
