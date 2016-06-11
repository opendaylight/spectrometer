import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'

import Avatar from 'material-ui/Avatar'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'
import ProjectsVsCommitsChart from './projects-vs-commits-chart'
import ProjectsVsAuthorsChart from './projects-vs-authors-chart'
import ProjectsVsOrganizationsChart from './projects-vs-organizations-chart'

const buttonActions = [
  {type: 'chart', option: 'summary', icon: 'assignment', tooltip: 'Projects Summary'},
  {type: 'chart', option: 'commitCountForAllProjects', icon: 'code', tooltip: 'Projects vs Commits'},
  {type: 'chart', option: 'authorsForAllProjects', icon: 'wrap_text', tooltip: 'Projects vs Authors'},
  {type: 'chart', option: 'organizationsForAllProjects', icon: 'business', tooltip: 'Projects vs Organizations'}
]

export default class AuthorsCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'commitCountForAllProjects'
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    const renderSummary = () => {
      return null
    }

    return (
      <PaperLayout id="projects" title="Projects"
        avatar={<Avatar iconClassName="material-icons folder" size={20}/>}
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        <div style={{margin: '1rem'}}>
          {this.state.view.chart === 'summary' && renderSummary()}
          {this.state.view.chart === 'commitCountForAllProjects' && <ProjectsVsCommitsChart projects={this.props.projects} />}
          {this.state.view.chart === 'authorsForAllProjects' && <ProjectsVsAuthorsChart projects={this.props.projects} />}
          {this.state.view.chart === 'organizationsForAllProjects' && <ProjectsVsOrganizationsChart projects={this.props.projects} />}
        </div>
      </PaperLayout>
    )
  }
}

AuthorsCard.propTypes = {
  projects: React.PropTypes.array
}
