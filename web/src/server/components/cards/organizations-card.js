import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

import ContributionsByOrganizationChart from '../charts/contributions-by-organization'
import LocByOrganizationChart from '../charts/loc-by-organization'
import OrganizationsVsAuthorsChart from './organizations-vs-authors-chart'

const buttonActions = [
  {type: 'chart', option: 'contributions-by-organization', icon: 'code', tooltip: 'Contributions By Organization'},
  {type: 'chart', option: 'loc-by-organization', icon: 'subject', tooltip: 'Lines of Code by Organization'},
  {type: 'chart', option: 'organizationsVsAuthors', icon: 'perm_identity', tooltip: 'Organizations vs Authors'}
]

export default class OrganizationsCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'contributions-by-organization'
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    const renderSummary = (projects) => {
      const commitCountArray = DataReducers.organizationsVsCommitsForAllProjects(projects)
      const c0 = DataReducers.mostAndLeast(commitCountArray, 'commits')
      const authorCountArray = DataReducers.organizationsVsAuthorsForAllProjects(projects)
      const a0 = DataReducers.mostAndLeast(authorCountArray, 'authorCount')
      return (
        <div>
          <p>
            <span className="text-project">{c0.most.name}</span>
            <span> is the <strong>most active organization</strong> by number of commits</span>
            <span className="text-commits"> ({c0.most.commits})</span>
            <span> followed by </span>
            <span className="text-project">{c0.secondMost.name}</span>
            <span className="text-commits"> ({c0.secondMost.commits})</span>
          </p>
          <p>
            <span className="text-project">{a0.most.name}</span>
            <span> is the <strong>most active organization</strong> by number of authors contributing</span>
            <span className="text-author"> ({a0.most.authorCount})</span>
            <span> followed by </span>
            <span className="text-project">{a0.secondMost.name}</span>
            <span className="text-commits"> ({a0.secondMost.authorCount})</span>
          </p>
        </div>
      )
    }

    return (
      <PaperLayout id="organizations" title="Organizations"
        avatar={<Avatar icon={<FontIcon className="material-icons">business</FontIcon>} size={30}></Avatar>}
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        <div style={{margin: '1rem'}}>
          {this.state.view.chart === 'contributions-by-organization' && <ContributionsByOrganizationChart projects={this.props.projects} />}
          {this.state.view.chart === 'loc-by-organization' && <LocByOrganizationChart projects={this.props.projects} />}
          {this.state.view.chart === 'organizationsVsAuthors' && <OrganizationsVsAuthorsChart projects={this.props.projects} />}
        </div>
      </PaperLayout>
    )
  }
}

OrganizationsCard.propTypes = {
  projects: React.PropTypes.array
}
