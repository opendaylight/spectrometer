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

import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react';

import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import {orange200, orange900} from 'material-ui/styles/colors';

import * as DataReducers from '../../api/data-reducers'

export default class ProjectList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: '',
      items: this.props.projects
    }
  }

  handleOnTouchTap = (project) => {
    this.props.onClick(project)
  }

  onRequestDelete = (project) => {
    this.props.onDelete(project)
  }

  handleFilterText = (event) => {
    this.setState({
      filter: event.target.value,
      items: _.filter(this.props.projects, x => x.name.match(new RegExp(event.target.value, 'i')))
    })
  }

  render() {
    if (_.isEmpty(this.props.projects)) return (null)
    // logger.info("project-list:render", this.props.selected)

    const renderList = (filteredItems, selectedNames) => {
      const filteredWithoutSelected = _.reject(filteredItems, x => selectedNames.indexOf(x.name) >= 0 )
      return (
        <div id="projects-list-content" className={this.props.className}>
          <div id="author-filter-container" style={{margin: '1rem 1rem'}}>
            <TextField id="author-filter"
              hintText="Type to filter"
              floatingLabelText="Filter Projects"
              value={this.state.filter} onChange={this.handleFilterText} />
          </div>
          <div id="project-selected-list" style={{margin: '1rem 1rem 0rem 1rem'}}>
            {
              _.map(selectedNames, (name) => {
                return (
                  <Chip key={name} backgroundColor={orange200}
                    style={{marginBottom: '1rem'}}
                    onTouchTap={this.handleOnTouchTap.bind(this, name)}
                    onRequestDelete={this.onRequestDelete.bind(this, name)}>
                    <Avatar size={32} color={orange200} backgroundColor={orange900}>
                      {name[0]}
                    </Avatar>
                    {_.truncate(name, {length: 20})}
                  </Chip>
                )
              })
            }
          </div>
          <Divider/>
          <div id="projects-filtered-list" style={{margin: '1rem 1rem 0rem 1rem', height: '100vh', overflow: 'auto'}}>
            {
              _.map(filteredWithoutSelected, (x) => {
                return (
                  <Chip key={x.name}
                    style={{marginBottom: '1rem'}}
                    onTouchTap={this.handleOnTouchTap.bind(this, x.name)}>
                    <Avatar size={32}> {x.name[0]} </Avatar>
                    {_.truncate(x.name, {length: 20})}
                  </Chip>
                )
              })
            }
          </div>
        </div>
      )
    }

    return (
      renderList(this.state.items, this.props.selected)
    )
  }
}

ProjectList.propTypes = {
  projects: React.PropTypes.array.isRequired,  //[{name:aaa, commits: []}, {name:l2switch, commits: []}]
  selected: React.PropTypes.array.isRequired,  //[aaa, aalldp, l2switch, ...]
  onClick: React.PropTypes.func.isRequired,
  onDelete: React.PropTypes.func.isRequired,
  className: React.PropTypes.string
}
