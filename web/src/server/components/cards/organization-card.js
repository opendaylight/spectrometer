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
 * React component to display Organization card
 * Used in /organizations page
 * Uses CardLayout
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'
import {connect} from 'react-redux'

import Avatar from 'material-ui/Avatar'

import * as DataReducers from '../../api/data-reducers'

import CardLayout from '../card-layout'
import ProjectsVsCommitsChart from '../charts/projects-vs-commits-chart'
import ProjectsVsAuthorsChart from '../charts/projects-vs-authors-chart'

const TOP_10 = require('../../../../config/spectrometer-web.json').top10

const buttonActions = [
  {type: 'chart', option: 'projects-vs-authors', icon: 'people', tooltip: 'Projects vs Authors Chart'},
  {type: 'chart', option: 'projects-vs-commits', icon: 'code', tooltip: 'Projects vs Commits Chart'},
  {type: 'chart', option: 'summary', icon: 'assignment', tooltip: 'Organization Summary'}
]

const renderSummary = (projects, card) => {
  const a0 = DataReducers.projectsVsContributorCount(projects, {contributor: 'author', organization: card.name})
  const authorCount = _.sumBy(a0, 'contributorCount')

  const p0 = DataReducers.projectsVsCommitCount(projects, {contributor: 'organization', organization: card.name})
  // const p1 = _.filter(p0, x => x.commitCount > 0)
  const commitCount = _.sumBy(p0, 'commitCount')
  const locCount = _.sumBy(p0, 'loc')

  return (
    <div className="card-summary">
      <p>
        <span className="text-project">{p0.length}</span><span> projects contributed</span>
      </p>
      <p>
        <span className="text-author">{authorCount}</span><span> authors have made </span><span className="text-commits">{commitCount}</span><span> commits</span>
      </p>
      <p>
        <span className="text-loc">{locCount}</span><span> lines of code modified</span>
      </p>
    </div>
  )
}

@connect(state => ({
  projects: state.spectro.projects
}))
export default class OrganizationCard extends Component {
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
    logger.info("organization-card:render", this.props.card.name)

    return (
      <CardLayout id={`org-card-${this.props.card.name}-${this.props.card.index}`}
        title={this.props.card.name} avatar={this.props.avatar}
        handleOnClose={this.handleOnClose.bind(this, this.props.card.index)}
        buttonActions={buttonActions}
        handleButtonActions={this.handleButtonActions.bind(this)}
        currentView={this.state.view}>
        {this.state.view.chart === 'summary' && renderSummary(this.props.projects, this.props.card)}
        {this.state.view.chart === 'projects-vs-commits' && <ProjectsVsCommitsChart projects={this.props.projects} view={{organization:this.props.card.name, takeRight: TOP_10}} />}
        {this.state.view.chart === 'projects-vs-authors' && <ProjectsVsAuthorsChart projects={this.props.projects} view={{organization:this.props.card.name, takeRight: TOP_10}} />}
      </CardLayout>
    )
  }
}

OrganizationCard.propTypes = {
  avatar: React.PropTypes.object,
  card: React.PropTypes.object,
  handleOnClose: React.PropTypes.func
}
