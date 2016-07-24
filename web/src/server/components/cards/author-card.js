import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'
import {connect} from 'react-redux'

import Avatar from 'material-ui/Avatar'

import * as GitStats from '../../git-stats/git-stats'
import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'
import ProjectsVsCommitsChart from './projects-vs-commits-chart'
import LocByProjectChart from '../charts/loc-by-project'

const buttonActions = [
  {type: 'chart', option: 'summary', icon: 'assignment', tooltip: 'Author Profile'},
  {type: 'chart', option: 'projectsVsCommits', icon: 'playlist_add_check', tooltip: 'Projects vs Commits Chart'},
  {type: 'chart', option: 'projectsVsLoc', icon: 'code', tooltip: 'Projects vs LOC Chart'}
]

@connect(state => ({
  projects: state.projects.projects
}))
export default class AuthorCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'summary'   //[timeVsLoc, timeVsLocDetails, authorsVsLoc]
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
      const commitCount = _.sumBy(DataReducers.commitCountForAllProjectsPerAuthor(series, this.props.card.name), 'commitCount')
      const loc = _.sumBy(DataReducers.locForAllProjectsPerAuthor(series, this.props.card.name), 'value')
      let commit1 = null, commit2 = null, project1 = null, project2 = null
      if (series.length > 0) {
        project1 = series[0]
        commit1 = (project1.commits.length > 0) ? project1.commits[0] : null
        project2 = series[series.length - 1]
        commit2 = (project2.commits.length > 0) ? project2.commits[project2.commits.length - 1] : null
      }

      return (
        <div>
          <p>
            <span className="text-email">{commit1.author_email}</span>
          </p>
          <p>
            <span className="text-project">{series.length}</span><span> projects contributed </span>
          </p>
          <p>
            <span className="text-commits">{commitCount}</span><span> commits</span>
          </p>
          <p>
            <span className="text-loc">{loc}</span><span> lines of code contributed</span>
          </p>
          <p>
            {commit1 && <span><span>First committed on </span><span className="text-time">{moment(commit1.authored_date*1000).format('DD-MMM-YYYY')}</span><span className="text-project"> ({project1.name})</span></span>}
          </p>
          <p>
            {commit2 && <span><span>Last committed on </span><span className="text-time">{moment(commit2.authored_date*1000).format('DD-MMM-YYYY')}</span><span className="text-project"> ({project2.name})</span></span>}
          </p>
        </div>
      )
    }

    const renderProjectsVsCommitsChart = (projectsForAuthor) => {
      return (<ProjectsVsCommitsChart projects={projectsForAuthor} author={this.props.card.name} />)
    }

    const renderProjectsVsLocChart = (projectsForAuthor) => {
      return (<LocByProjectChart projects={projectsForAuthor} author={this.props.card.name} />)
    }

    if (_.isEmpty(this.props.card)) return (null)
    const projectsForAuthor = DataReducers.projectsContainingAuthor(this.props.projects, this.props.card.name)

    console.info("author-card:render", this.props.card.name)
    return (
      <PaperLayout id={`author-layout-${this.props.card.name}-${this.props.card.index}`} style={{width: '49%', margin: '0.2rem'}}
        title={this.props.card.name} avatar={this.props.avatar}
        handleOnClose={this.handleOnClose.bind(this, this.props.card.index)}
        buttonActions={buttonActions}
        handleButtonActions={this.handleButtonActions.bind(this)}
        currentView={this.state.view}>
        <div style={{margin: '1rem'}}>
          {this.state.view.chart === 'summary' && renderSummary(projectsForAuthor)}
          {this.state.view.chart === 'projectsVsCommits' && renderProjectsVsCommitsChart(projectsForAuthor)}
          {this.state.view.chart === 'projectsVsLoc' && renderProjectsVsLocChart(projectsForAuthor)}
        </div>
      </PaperLayout>
    )
  }
}

AuthorCard.propTypes = {
  card: React.PropTypes.object,
  handleOnClose: React.PropTypes.func,
  avatar: React.PropTypes.object
}
