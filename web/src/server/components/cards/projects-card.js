import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'
import ContributionsByProjectChart from '../charts/contributions-by-project'
import LocByProjectChart from '../charts/loc-by-project'
import ProjectsVsAuthorsChart from './projects-vs-authors-chart'
import ProjectsVsOrganizationsChart from './projects-vs-organizations-chart'
import TimeVsProjectsChart from './time-vs-projects-chart'

const buttonActions = [
  {type: 'chart', option: 'contributions-by-project', icon: 'code', tooltip: 'Contributions By Project'},
  {type: 'chart', option: 'loc-by-project', icon: 'subject', tooltip: 'Lines of Code by Project'},
  {type: 'chart', option: 'timeline', icon: 'timeline', tooltip: 'Projects Timeline'},
  {type: 'chart', option: 'authorsForAllProjects', icon: 'perm_identity', tooltip: 'Projects vs Authors'},
  {type: 'chart', option: 'organizationsForAllProjects', icon: 'business', tooltip: 'Projects vs Organizations'}
]

export default class ProjectsCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'contributions-by-project'
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    const renderSummary = (projects) => {
      const commitCountArray = DataReducers.commitCountForAllProjects(projects)
      const c0 = DataReducers.mostAndLeast(commitCountArray, 'commitCount')
      const authorCountArray = DataReducers.authorCountForAllProjects(projects)
      const a0 = DataReducers.mostAndLeast(authorCountArray, 'authorCount')
      const orgCountArray = DataReducers.organizationCountForAllProjects(projects)
      const o0 = DataReducers.mostAndLeast(orgCountArray, 'organizationCount')
      return (
        <div>
          <p>
            <span className="text-project">{c0.most.name}</span>
            <span> is the <strong>most active project</strong> by number of commits</span>
            <span className="text-commits"> ({c0.most.commitCount})</span>
            <span> followed by </span>
            <span className="text-project">{c0.secondMost.name}</span>
            <span className="text-commits"> ({c0.secondMost.commitCount})</span>
          </p>
          <p>
            <span className="text-project">{a0.most.name}</span>
            <span> is the <strong>most active project</strong> by number of authors contributing</span>
            <span className="text-author"> ({a0.most.authorCount})</span>
            <span> followed by </span>
            <span className="text-project">{a0.secondMost.name}</span>
            <span className="text-author"> ({a0.secondMost.authorCount})</span>
          </p>
          <p>
            <span className="text-project">{o0.most.name}</span>
            <span> is the <strong>most active project</strong> by number of organizations collaborating</span>
            <span className="text-organization"> ({o0.most.organizationCount})</span>
            <span> followed by </span>
            <span className="text-project">{o0.secondMost.name}</span>
            <span className="text-organization"> ({o0.secondMost.organizationCount})</span>
          </p>
        </div>
      )
    }

    const { projects, ...props } = this.props

    return (
      <PaperLayout id="projects" title="Projects" titleClassName="project"
        avatar={<Avatar icon={<FontIcon className="material-icons">folder</FontIcon>} size={30}></Avatar>}
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        <div style={{margin: '1rem'}} className="animated fadeIn">
          {this.state.view.chart === 'contributions-by-project' && <ContributionsByProjectChart projects={projects} />}
          {this.state.view.chart === 'loc-by-project' && <LocByProjectChart projects={projects} />}
          {this.state.view.chart === 'timeline' && <TimeVsProjectsChart projects={projects}/> }
          {this.state.view.chart === 'authorsForAllProjects' && <ProjectsVsAuthorsChart projects={projects} />}
          {this.state.view.chart === 'organizationsForAllProjects' && <ProjectsVsOrganizationsChart projects={projects} />}
        </div>
      </PaperLayout>
    )
  }
}

ProjectsCard.propTypes = {
  projects: React.PropTypes.array
}
