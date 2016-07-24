import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'
import {connect} from 'react-redux'

import Avatar from 'material-ui/Avatar'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'
import ContributionsByProjectChart from '../charts/contributions-by-project'
import ProjectsVsAuthorsChart from './projects-vs-authors-chart'
import LocByProjectChart from '../charts/loc-by-project'

const buttonActions = [
  {type: 'chart', option: 'summary', icon: 'assignment', tooltip: 'Organization Summary'},
  {type: 'chart', option: 'contributions-by-project', icon: 'code', tooltip: 'Contributions by Project'},
  {type: 'chart', option: 'projectsVsLoc', icon: 'subject', tooltip: 'Projects vs LOC Chart'},
  {type: 'chart', option: 'projectsVsAuthors', icon: 'perm_identity', tooltip: 'Projects vs Authors Chart'}
]

@connect(state => ({
  projects: state.projects.projects
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
    const renderSummary = (series) => {
      const commitCount = _.sumBy(DataReducers.commitCountForAllProjectsPerOrg(series, this.props.card.name), 'commitCount')
      const loc = _.sumBy(DataReducers.locForAllProjectsPerOrg(series, this.props.card.name), 'value')
      const authors = DataReducers.uniqueAuthorsForAllProjects(series, this.props.card.name).length
      return (
        <div>
          <p>
            <span className="text-project">{series.length}</span><span> projects contributed</span>
          </p>
          <p>
            <span className="text-author">{authors}</span><span> authors have made </span><span className="text-commits">{commitCount}</span><span> commits</span>
          </p>
          <p>
            <span className="text-loc">{loc}</span><span> lines of code</span>
          </p>
        </div>
      )
    }

    const renderProjectsVsCommitsChart = (projectsForOrg) => {
      return (<ContributionsByProjectChart projects={this.props.projects} organization={this.props.card.name} />)
    }

    const renderProjectsVsLocChart = (projectsForOrg) => {
      return (<LocByProjectChart projects={this.props.projects} organization={this.props.card.name} />)
    }

    const renderProjectsVsAuthorsChart = (projectsForOrg) => {
      return (<ProjectsVsAuthorsChart projects={this.props.projects} organization={this.props.card.name} />)
    }

    if (_.isEmpty(this.props.card)) return (null)
    const projectsForOrg = DataReducers.projectsContainingOrganization(this.props.projects, this.props.card.name)

    console.info("organization-card:render", this.props.card.name)
    return (
      <PaperLayout id={`org-layout-${this.props.card.name}-${this.props.card.index}`} style={{width: '49%', margin: '0.2rem'}}
        title={this.props.card.name} avatar={this.props.avatar}
        handleOnClose={this.handleOnClose.bind(this, this.props.card.index)}
        buttonActions={buttonActions}
        handleButtonActions={this.handleButtonActions.bind(this)}
        currentView={this.state.view}>
        <div style={{margin: '1rem'}}>
          {this.state.view.chart === 'summary' && renderSummary(projectsForOrg)}
          {this.state.view.chart === 'contributions-by-project' && renderProjectsVsCommitsChart(projectsForOrg)}
          {this.state.view.chart === 'projectsVsLoc' && renderProjectsVsLocChart(projectsForOrg)}
          {this.state.view.chart === 'projectsVsAuthors' && renderProjectsVsAuthorsChart(projectsForOrg)}
        </div>
      </PaperLayout>
    )
  }
}

OrganizationCard.propTypes = {
  card: React.PropTypes.object,
  handleOnClose: React.PropTypes.func,
  avatar: React.PropTypes.object
}
