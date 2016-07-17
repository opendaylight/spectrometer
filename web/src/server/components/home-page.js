import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react';
import {connect} from 'react-redux';

import {Tabs, Tab} from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import * as DataReducers from '../api/data-reducers'
import TrendCard from './cards/trend-card'
import CommunityCard from './cards/community-card'
import ProjectsCard from './cards/projects-card'
import OrganizationsCard from './cards/organizations-card'
import ContributorsCard from './cards/contributors-card'
import ModulesCard from './cards/modules-card'
import CompaniesCard from './cards/companies-card'

@connect(state => ({
  projects: state.projects.projects
}))
export default class HomePage extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    if (!process.browser || _.isEmpty(this.props.projects)) return null

    const master = DataReducers.filterMasterProjects(this.props.projects)
    console.info("HomePage:Projects Count:", master ? master.length : 0)

    return (
      <div id="overview" className="flex-row-content">
        <div id="left-panel-graphs" style={{flexGrow: 1, marginLeft: '0.5rem', marginTop: '0.5rem'}}>
          <div id="graphs-content" className="flex-column-content">
            <ContributorsCard projects={master} />
            <ModulesCard projects={master} />
            <CompaniesCard projects={master} />
            <ProjectsCard projects={master} />
            <OrganizationsCard projects={master} />
          </div>
        </div>
        <div id="right-panel" style={{flexGrow: 0, marginLeft: '0.5rem', marginTop: '0.5rem', width: '25%'}}>
          <div className="flex-column-content">
            <div style={{flexGrow: 0}}>
              <CommunityCard projects={master} />
            </div>
            <div style={{flexGrow: 1}}>
              <TrendCard projects={master} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
