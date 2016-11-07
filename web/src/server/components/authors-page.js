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
 * React component to Authors Page
 * Used in routes.js for /authors url
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'
import {connect} from 'react-redux'

import * as DataReducers from '../api/data-reducers'
import * as GitStats from '../git-stats/git-stats'

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import AuthorCard from './cards/author-card'
import AuthorList from './lists/author-list'
import Hints from './hints'

@connect(state => ({
  authors: DataReducers.allContributors(DataReducers.filterMasterProjects(state.spectro.projects), {contributor: 'author'}),
  cards: state.spectro.authorCards
}))
export default class AuthorsPage extends Component {

  constructor(props) {
    super(props)
  }

  handleAddCard = (name) => {
    logger.info("authors-page", "handleAddCard", name)
    this.props.dispatch(GitStats.authorsPageAddCard(name))
  }

  handleRemoveCard = (index) => {
    this.props.dispatch(GitStats.authorsPageRemoveCard(name, index))
  }

  handleRemoveCards = (name) => {
    this.props.dispatch(GitStats.authorsPageRemoveCards(name))
  }

  render() {
    if (!process.browser || _.isEmpty(this.props.authors)) return null

    return (
      <div id="authors-page" className="page-content">
        <div id="author-cards-content" className="page-content-left">
          {
            _.isEmpty(this.props.cards) ? (<Hints type="author" />)
            : _.map(this.props.cards, (x) => {
              return (
                <AuthorCard key={`authors-page-${x.name}-${x.index}`}
                  avatar={<Avatar size={30}>{x.name.charAt(0)}</Avatar>}
                  card={x}
                  handleOnClose={this.handleRemoveCard}
                />
            )})
          }
        </div>
        <AuthorList authors={this.props.authors} className="page-content-right page-content-right--border"
          selected={_.uniq(_.map(this.props.cards, 'name'))}
          onClick={this.handleAddCard}
          onDelete={this.handleRemoveCards} />
      </div>
    )
  }
}
