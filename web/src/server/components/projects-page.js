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
 * React component to display Projects Page
 * Maps to routes.js /projects url
 * Displays all projects in a list and on clicking each item, displays the relevant Project Card
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'

import React, { Component } from 'react'
import {connect} from 'react-redux'

import * as DataReducers from '../api/data-reducers'
import * as GitStats from '../git-stats/git-stats'

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import ProjectCard from './cards/project-card'
import ProjectList from './lists/project-list'
import Hints from './hints'

@connect(state => ({
  projects: DataReducers.filterMasterProjects(state.spectro.projects),
  cards: state.spectro.projectCards
}))
export default class ProjectsPage extends Component {

  constructor(props) {
    super(props)
  }

  handleAddCard = (name) => {
    logger.info("projects-page:handleAddCard", name)
    this.props.dispatch(GitStats.projectsPageAddCard(name))
  }

  handleRemoveCard = (index) => {
    this.props.dispatch(GitStats.projectsPageRemoveCard(name, index))
  }

  handleRemoveCards = (name) => {
    this.props.dispatch(GitStats.projectsPageRemoveCards(name))
  }

  render() {
    if (!process.browser || _.isEmpty(this.props.projects)) return null
    return (
      <div id="projects-page" className="page-content">
        <div id="project-cards-content" className="page-content-left">
          {
            _.isEmpty(this.props.cards) ? (<Hints type="project" />)
            : _.map(this.props.cards, (x) => {
              return (
                <ProjectCard key={`projects-page-${x.name}-${x.index}`}
                  avatar={<Avatar size={30}>{x.name.charAt(0)}</Avatar>}
                  card={x}
                  handleOnClose={this.handleRemoveCard}
                />
            )})
          }
        </div>
        <ProjectList projects={this.props.projects} className="page-content-right page-content-right--border"
          selected={_.uniq(_.map(this.props.cards, 'name'))}
          onClick={this.handleAddCard}
          onDelete={this.handleRemoveCards} />
      </div>
    )
  }
}
