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
 * React component to display Project card
 * Used in /projects page
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

import * as GitStats from '../../git-stats/git-stats'
import * as DataReducers from '../../api/data-reducers'
import * as Branches from '../../api/branches'

import CardLayout from '../card-layout'
import TimeVsCommitsChart from '../charts/time-vs-commits-chart'
// import TimeVsLocDetailsChart from '../charts/time-vs-loc-details-chart'
import AuthorsVsCommitsChart from '../charts/authors-vs-commits-chart'
import OrganizationsVsCommitsChart from '../charts/organizations-vs-commits-chart'

const TOP_10 = require('../../../../config/spectrometer-web.json').top10

const buttonActions = [
  {type: 'chart', option: 'time-vs-commits', icon: 'date_range', tooltip: 'Time vs Commits Chart'},
  {type: 'chart', option: 'authors-vs-commits', icon: 'people', tooltip: 'Authors vs Commits Chart'},
  {type: 'chart', option: 'organizations-vs-commits', icon: 'business', tooltip: 'Organizations vs Commits Chart'},
  {type: 'chart', option: 'summary', icon: 'assignment', tooltip: 'Project Summary'}
]

const renderSummary = (projects, name, ref1, ref2) => {
  logger.info("project-card:renderSummary", projects.length, name, ref1, ref2)
  const p0 = DataReducers.findBranchProject(projects, {name, ref1, ref2})
  if (!p0) return null
  const uniqueAuthors = DataReducers.projectsVsContributors(projects, {name, ref1, ref2, contributor: 'author'})
  const cd = DataReducers.mostAndLeast(p0.commits, 'authored_date') //most and least commits by date
  const ac0 = DataReducers.authorsVsCommitCount(projects, {name, ref1, ref2})
  const cc = DataReducers.mostAndLeast(ac0, 'commitCount') //most and least commits by count
  const loc = DataReducers.mostAndLeast(ac0, 'loc') //most and least by loc
  //to find who initiated, need data from masterBranch
  const masterBranch = DataReducers.findBranchProject(projects, {name})
  const cm = DataReducers.mostAndLeast(masterBranch.commits, 'authored_date')

  return (
    <div id="project-card-summary" className="card-summary">
      <p>
        <span className="text-author">{uniqueAuthors[0].contributors.length}</span><span> authors made </span>
        <span className="text-commits">{p0.commits.length}</span><span> commits</span>
      </p>
      <p>
        <span className="text-author">{cd.most1.author}</span> <span> authored last </span> <span className="text-time">{moment(cd.most1.authored_date).fromNow()}</span>
      </p>
      <p>
        {cc.most1 && (<span><span className="text-author">{cc.most1.name}</span><span className="text-commits"> ({cc.most1.commitCount})</span><span> committed most</span></span>)}
        {cc.most2 && (<span><span>, followed by </span><span className="text-author">{cc.most2.name}</span><span className="text-commits"> ({cc.most2.commitCount})</span></span>)}
      </p>
      <p>
        {loc.most1 && (<span><span className="text-author">{loc.most1.name}</span><span className="text-commits"> ({loc.most1.loc})</span><span> coded most</span></span>)}
        {loc.most2 && (<span><span>, followed by </span><span className="text-author">{loc.most2.name}</span><span className="text-commits"> ({loc.most2.loc})</span></span>)}
      </p>
      <p>
        <span className="text-author">{cm.least1.author}</span> <span> initiated on </span> <span className="text-time">{moment(cm.least1.authored_date).format("DD-MMM-YYYY")}</span>
      </p>
    </div>
  )
}

@connect(state => ({
  projects: state.spectro.projects,
}))
export default class ProjectCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        ref1: 'master',
        ref2: 'master',
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

  handleBranchActions = (value) => {
    logger.info("project-card:handleBranchActions", value)
    const ref1 = Branches.findBranchNameByIndex(value[0]) //from branch
    const ref2 = Branches.findBranchNameByIndex(value[1]) //upto branch
    //fetch if not existing
    // if (!DataReducers.findBranchProject(this.props.projects, {name: this.props.card.name, ref1, ref2})) {
      this.props.dispatch(GitStats.setProjectCommitsSinceRef(this.props.card.name, ref1, ref2))
    // }
    let newView = _.merge(this.state.view, {ref1, ref2})
    this.setState({ view: newView })
  }

  render() {

    if (_.isEmpty(this.props.card)) return (null)

    const branchActions = DataReducers.findBranchActions(this.props.projects, this.props.card.name)
    logger.info("project-card:render", this.props.card.name, this.state.view)
    logger.info("project-card:branchActions", branchActions)
    return (
      <CardLayout id={`projects-layout-${this.props.card.name}-${this.props.card.index}`} title={this.props.card.name}
        avatar={this.props.avatar}
        handleOnClose={this.handleOnClose.bind(this, this.props.card.index)}
        buttonActions={buttonActions} handleButtonActions={this.handleButtonActions.bind(this)}
        branchActions={branchActions} handleBranchActions={this.handleBranchActions}
        currentView={this.state.view}>
        {this.state.view.chart === 'summary' && renderSummary(this.props.projects, this.props.card.name, this.state.view.ref1, this.state.view.ref2)}
        {this.state.view.chart === 'time-vs-commits' && <TimeVsCommitsChart projects={this.props.projects} view={{name: this.props.card.name, ref1: this.state.view.ref1, ref2: this.state.view.ref2}}/>}
        {this.state.view.chart === 'authors-vs-commits' && <AuthorsVsCommitsChart projects={this.props.projects} view={{name: this.props.card.name, ref1: this.state.view.ref1, ref2: this.state.view.ref2, takeRight: TOP_10}} />}
        {this.state.view.chart === 'organizations-vs-commits' && <OrganizationsVsCommitsChart projects={this.props.projects} view={{name: this.props.card.name, ref1: this.state.view.ref1, ref2: this.state.view.ref2, takeRight: TOP_10}} />}
      </CardLayout>
    )
  }
}

ProjectCard.propTypes = {
  avatar: React.PropTypes.object,
  card: React.PropTypes.object,  /* { name: project-name, index: 0 } */
  handleOnClose: React.PropTypes.func
}
