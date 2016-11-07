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
 * React component to display Organizations Page
 * Maps to routes.js /organizations url
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

import OrganizationCard from './cards/organization-card'
import OrganizationList from './lists/organization-list'
import Hints from './hints'

@connect(state => ({
  organizations: DataReducers.allContributors(DataReducers.filterMasterProjects(state.spectro.projects), {contributor: 'organization'}),
  cards: state.spectro.organizationCards
}))
export default class OrganizationsPage extends Component {

  constructor(props) {
    super(props)
  }

  handleAddCard = (name) => {
    logger.info("organizations-page:handleAddCard", name)
    this.props.dispatch(GitStats.organizationsPageAddCard(name))
  }

  handleRemoveCard = (index) => {
    this.props.dispatch(GitStats.organizationsPageRemoveCard(name, index))
  }

  handleRemoveCards = (name) => {
    this.props.dispatch(GitStats.organizationsPageRemoveCards(name))
  }

  render() {
    if (!process.browser || _.isEmpty(this.props.organizations)) return null

    return (
      <div id="organizations-page" className="page-content">
        <div id="organization-cards-content" className="page-content-left">
          {
            _.isEmpty(this.props.cards) ? (<Hints type="organization" />)
            : _.map(this.props.cards, (x) => {
              return (
                <OrganizationCard key={`organizations-page-${x.name}-${x.index}`}
                  avatar={<Avatar size={30}>{x.name.charAt(0)}</Avatar>}
                  card={x}
                  handleOnClose={this.handleRemoveCard}
                />
            )})
          }
        </div>
        <OrganizationList organizations={this.props.organizations}  className="page-content-right page-content-right--border"
          selected={_.uniq(_.map(this.props.cards, 'name'))}
          onClick={this.handleAddCard}
          onDelete={this.handleRemoveCards} />
      </div>
    )
  }
}
