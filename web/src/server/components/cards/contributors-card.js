import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'
import ContributionsByContributorChart from '../charts/contributions-by-contributor'

const buttonActions = [
  {type: 'chart', option: 'contributions-by-contributor', icon: 'code', tooltip: 'Contributions By Contributor'},
]

export default class ContributorsCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      view: {
        chart: 'contributions-by-contributor'
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    return (
      <PaperLayout id="contributors" title="Contributors"
        avatar={<Avatar icon={<FontIcon className="material-icons">people</FontIcon>} size={30}></Avatar>}
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        <div style={{margin: '1rem'}}>
          {this.state.view.chart === 'contributions-by-contributor' && <ContributionsByContributorChart projects={this.props.projects} />}
        </div>
      </PaperLayout>
    )
  }
}

ContributorsCard.propTypes = {
  projects: React.PropTypes.array
}
