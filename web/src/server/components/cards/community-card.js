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
 * React component to display the Community Card in the home page
 * Displays overall summary of Projects, Authors, Organizations, Commits, LoC Modified
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'
import numeral from 'numeral'

import React, { Component } from 'react';
import {connect} from 'react-redux';

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'

import CardLayout from '../card-layout'

export default class CommunityCard extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const totalAuthors = DataReducers.allContributors(this.props.projects, {contributor: 'author'})
    const totalOrganizations = DataReducers.allContributors(this.props.projects, {contributor: 'organization'})
    const projectCommits = DataReducers.projectsVsCommitCount(this.props.projects)
    const totalCommits = _.sumBy(projectCommits, 'commitCount')
    const totalLoc = _.sumBy(projectCommits, 'loc')

    return (
      <CardLayout id="community" title="Community" className="card--fit"
        avatar={<Avatar  icon={<FontIcon className="material-icons">group_work</FontIcon>} size={30}></Avatar>}>
        <div className="card-summary">
          <div><span className="number-stat text-project animated zoomIn">{this.props.projects.length}</span><span className="community-card-text">projects</span></div>
          <div><span className="number-stat text-organization animated fadeIn">{totalOrganizations.length}</span><span className="community-card-text">organizations</span></div>
          <div><span className="number-stat text-author animated zoomIn">{totalAuthors.length}</span><span className="community-card-text">authors</span></div>
          <div><span className="number-stat text-commits animated fadeIn">{numeral(totalCommits).format('0.0a')}</span><span className="community-card-text">commits</span></div>
          <div><span className="number-stat text-loc animated zoomIn">{numeral(totalLoc).format('0.0a')}</span><span className="community-card-text">lines modified</span></div>
        </div>
      </CardLayout>
    )
  }
}

CommunityCard.propTypes = {
  projects: React.PropTypes.array.isRequired,
}
