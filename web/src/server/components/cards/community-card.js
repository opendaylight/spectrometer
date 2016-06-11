import _ from 'lodash'

import React, { Component } from 'react';
import {connect} from 'react-redux';
import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

const textStyle = {
  marginLeft: '0.5rem',
  textTransform: 'uppercase',
  color: '#606060'
}

export default class CommunityCard extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const authors = DataReducers.uniqueAuthorsForAllProjects(this.props.projects)
    const totalOrganizations = DataReducers.uniqueOrganizationsForAllProjects(this.props.projects)
    const totalCommits = _.reduce(this.props.projects, (sum, p) => { return sum + p.commits.length }, 0 )
    const totalLoc = _.reduce(DataReducers.locForAllProjects(this.props.projects), (sum, p) => { return sum + p.value }, 0 )

    return (
      <PaperLayout id="community" title="Community" titleClassName="community"
        avatar={<Avatar  icon={<FontIcon className="material-icons">group_work</FontIcon>} size={30}></Avatar>}>
        <div style={{margin: '1rem'}}>
          <div><span className="number-stat text-project animated zoomIn">{this.props.projects.length}</span><span style={textStyle}>projects</span></div>
          <div><span className="number-stat text-organization animated fadeIn">{totalOrganizations.length}</span><span style={textStyle}>organizations</span></div>
          <div><span className="number-stat text-author animated zoomIn">{authors.length}</span><span style={textStyle}>authors</span></div>
          <div><span className="number-stat text-commits animated fadeIn">{totalCommits}</span><span style={textStyle}>commits</span></div>
          <div><span className="number-stat text-loc animated zoomIn">{totalLoc}</span><span style={textStyle}>lines of code</span></div>
        </div>
      </PaperLayout>
    )
  }
}

CommunityCard.propTypes = {
  projects: React.PropTypes.array.isRequired,
}
