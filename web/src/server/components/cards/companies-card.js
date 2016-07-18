import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'
import ContributionsByCompaniesChart from './contributions-by-companies-chart'

const buttonActions = [
  {type: 'chart', option: 'contributionsByCompanies', icon: 'business', tooltip: 'Contributions By Companies'},
]

export default class CompaniesCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'contributionsByCompanies'
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    return (
      <PaperLayout id="companies" title="Companies"
        avatar={<Avatar icon={<FontIcon className="material-icons">business</FontIcon>} size={30}></Avatar>}
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        <div style={{margin: '1rem'}}>
          {this.state.view.chart === 'contributionsByCompanies' && <ContributionsByCompaniesChart projects={this.props.projects} />}
        </div>
      </PaperLayout>
    )
  }
}

CompaniesCard.propTypes = {
  projects: React.PropTypes.array
}
