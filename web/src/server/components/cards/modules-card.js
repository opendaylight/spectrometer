import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'
import ContributionsByModulesChart from './contributions-by-modules-chart'

const buttonActions = [
  {type: 'chart', option: 'contributionsByModules', icon: 'code', tooltip: 'Contributions By Modules'},
]

export default class ModulesCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'contributionsByModules'
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    return (
      <PaperLayout id="modules" title="Modules"
        avatar={<Avatar icon={<FontIcon className="material-icons">folder</FontIcon>} size={30}></Avatar>}
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        <div style={{margin: '1rem'}}>
          {this.state.view.chart === 'contributionsByModules' && <ContributionsByModulesChart projects={this.props.projects} />}
        </div>
      </PaperLayout>
    )
  }
}

ModulesCard.propTypes = {
  projects: React.PropTypes.array
}
