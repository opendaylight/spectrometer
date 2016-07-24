import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'
import {connect} from 'react-redux'

import Avatar from 'material-ui/Avatar'

import * as GitStats from '../../git-stats/git-stats'
import * as DataReducers from '../../api/data-reducers'
import ContributionsByContributorChart from '../charts/contributions-by-contributor'
import PaperLayout from '../layouts/paper-layout'
import TimeVsCommitsChart from './time-vs-commits-chart'
import TimeVsLocChart from './time-vs-loc-chart'
import TimeVsLocDetailsChart from './time-vs-loc-details-chart'
import AuthorsVsLocChart from './authors-vs-loc-chart'
import OrganizationsVsCommitsChart from './organizations-vs-commits-chart'
import LocByOrganizationChart from '../charts/loc-by-organization'

const buttonActions = [
  {type: 'chart', option: 'summary', icon: 'assignment', tooltip: 'Project Summary'},
  {type: 'chart', option: 'contributions-by-contributor', icon: 'code', tooltip: 'Contributions By Contributor'},
  {type: 'chart', option: 'timeVsCommits', icon: 'date_range', tooltip: 'Time vs Commits Chart'},
  {type: 'chart', option: 'timeVsLoc', icon: 'access_time', tooltip: 'Time vs LOC Chart'},
  {type: 'chart', option: 'timeVsLocDetails', icon: 'timelapse', tooltip: 'Time vs LOC Details Chart'},
  {type: 'chart', option: 'authorsVsLoc', icon: 'perm_identity', tooltip: 'Authors vs LOC Chart'},
  {type: 'chart', option: 'organizationsVsCommits', icon: 'playlist_add_check', tooltip: 'Organizations vs Commits Chart', group: true},
  {type: 'chart', option: 'organizationsVsLoc', icon: 'code', tooltip: 'Organizations vs LOC Chart'}
]

@connect(state => ({
  projects: state.projects.projects
}))
export default class ProjectCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        ref1: 'master',
        ref2: 'master',
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

  handleBranchActions = (name) => {
    let ref1 = this.state.view.ref1
    let ref2 = this.state.view.ref2
    if (ref1 === ref2) {
      //both tips are at same point (eg master)
      if (ref1 !== name && ref2 !== name) {
        //the new click is on a different element (eg beryllium)
        //set ref2 for now, can switch sequence later
        ref2 = name
      }
    } else {
      //tips are different (eg master and beryllium)
      if (ref1 === name || ref2 === name) {
        //the new click is on either of them again
        //move the tip to that element
        ref1 = ref2 = name
      } else {
        //the new click is on a totally new element
        ref2 = name
      }
    }
    //swap ref1 and ref2 if out of sequence
    [ref1, ref2] = DataReducers.swapBranchRefs(ref1, ref2)

    //fetch if not existing
    if (!DataReducers.findBranchProject(this.props.projects, this.props.card.name, ref1, ref2)) {
      this.props.dispatch(GitStats.setProjectCommitsSinceRef(this.props.card.name, ref1, ref2))
    }
    let newView = _.merge(this.state.view, {ref1, ref2})
    this.setState({ view: newView })
  }

  render() {
    const renderSummary = (project) => {
      const uniqueAuthors = DataReducers.authorsForOneProject(project)
      const cd = DataReducers.mostAndLeast(project.commits, 'authored_date') //most and least commits by date
      const cc = DataReducers.mostAndLeast(DataReducers.authorsVsCommitsForOneProject(project), 'commitCount') //most and least commits by count
      const loc = DataReducers.mostAndLeast(DataReducers.authorsVsLocForOneProject(project), 'loc') //most and least by loc
      //to find who initiated, need data from masterBranch
      const masterBranch = DataReducers.findBranchProject(this.props.projects, this.props.card.name, 'master', 'master')
      const cm = DataReducers.mostAndLeast(masterBranch.commits, 'authored_date')

      return (
        <div>
          <p>
            <span className="text-author">{uniqueAuthors.length}</span><span> authors made </span>
            <span className="text-commits">{project.commits.length}</span><span> commits</span>
          </p>
          <p>
            <span className="text-author">{cd.most1.author}</span> <span> authored last </span> <span className="text-time">{moment(cd.most1.authored_date*1000).fromNow()}</span>
          </p>
          <p>
            {cc.most1 && (<span><span className="text-author">{cc.most1.name}</span><span className="text-commits"> ({cc.most1.commitCount})</span><span> committed most</span></span>)}
            {cc.most2 && (<span><span>, followed by </span><span className="text-author">{cc.most2.name}</span><span className="text-commits"> ({cc.most2.commitCount})</span></span>)}
          </p>
          <p>
            {loc.most1 && (<span><span className="text-author">{loc.most1.name}</span><span className="text-commits"> ({loc.most1.loc})</span><span> coded most</span></span>)}
            {loc.most2 && (<span><span>, followed by </span><span className="text-author">{loc.most2.name}</span><span className="text-commits"> ({loc.most2.loc})</span></span>)}
          </p>
          <p>
            <span className="text-author">{cm.least1.author}</span> <span> initiated on </span> <span className="text-time">{moment(cm.least1.authored_date*1000).format("DD-MMM-YYYY")}</span>
          </p>
        </div>
      )
    }

    const renderTimeVsCommits = (project) => {
      return (<TimeVsCommitsChart project={project} />)
    }

    const renderTimeVsLoc = (project) => {
      return (<TimeVsLocChart project={project} />)
    }

    const renderTimeVsLocDetails = (project) => {
      return (<TimeVsLocDetailsChart project={project}  />)
    }

    const renderAuthorsVsLoc = (project) => {
      return (<AuthorsVsLocChart project={project}  />)
    }

    const renderOrganizationsVsCommits = (project) => {
      return (<OrganizationsVsCommitsChart project={project}  />)
    }

    const renderOrganizationsVsLoc = (project) => {
      return (<LocByOrganizationChart project={project}  />)
    }

    if (_.isEmpty(this.props.card)) return (null)

    const project = DataReducers.findBranchProject(this.props.projects, this.props.card.name, this.state.view.ref1, this.state.view.ref2)
    const branchActions = DataReducers.findBranchActions(this.props.projects, this.props.card.name)
    console.info("project-card:render", this.props.card.name, this.state.view.ref1, this.state.view.ref2, project)
    return (
      <PaperLayout id={`projects-layout-${this.props.card.name}-${this.props.card.index}`} style={{width: '49%', margin: '0.2rem'}}
        title={this.props.card.name} avatar={this.props.avatar}
        handleOnClose={this.handleOnClose.bind(this, this.props.card.index)}
        buttonActions={buttonActions} handleButtonActions={this.handleButtonActions.bind(this)}
        branchActions={branchActions} handleBranchActions={this.handleBranchActions.bind(this)}
        currentView={this.state.view}>
        {project && <div style={{margin: '1rem'}}>
          {this.state.view.chart === 'summary' && renderSummary(project)}
          {this.state.view.chart === 'contributions-by-contributor' && <ContributionsByContributorChart project={project} />}
          {this.state.view.chart === 'timeVsCommits' && renderTimeVsCommits(project)}
          {this.state.view.chart === 'timeVsLoc' && renderTimeVsLoc(project)}
          {this.state.view.chart === 'timeVsLocDetails' && renderTimeVsLocDetails(project)}
          {this.state.view.chart === 'authorsVsLoc' && renderAuthorsVsLoc(project)}
          {this.state.view.chart === 'organizationsVsCommits' && renderOrganizationsVsCommits(project)}
          {this.state.view.chart === 'organizationsVsLoc' && renderOrganizationsVsLoc(project)}
        </div>}
      </PaperLayout>
    )
  }
}

ProjectCard.propTypes = {
  card: React.PropTypes.object,
  handleOnClose: React.PropTypes.func,
  avatar: React.PropTypes.object
}
