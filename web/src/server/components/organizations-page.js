import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'
import {connect} from 'react-redux'

import * as DataReducers from '../api/data-reducers'

import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'

import OrganizationCard from './cards/organization-card'
import OrganizationList from './cards/organization-list'

@connect(state => ({
  projects: state.projects.projects
}))
export default class OrganizationsPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cards: []
    }
  }

  handleAddCard = (orgName) => {
    const maxIndex = this.state.cards.length + 1
    this.setState({
      cards: this.state.cards.concat({index: maxIndex, name: orgName})
    })
  }

  handleRemoveCard = (index) => {
    this.setState({
      cards: _.reject(this.state.cards, x => x.index === index )
    })
  }

  render() {
    if (!process.browser || _.isEmpty(this.props.projects)) return null
    console.info("organizations-page:render")
    const master = DataReducers.filterMasterProjects(this.props.projects)

    return (
      <div id="organizations-page" className="flex-row-content">
        <div style={{flexGrow: 0, alignSelf: 'stretch'}}>
          <OrganizationList projects={master}  onClick={this.handleAddCard.bind(this)} />
        </div>
        <div style={{flexGrow: 1}}>
          <div id="orgnanization-cards-content" className="project-card">
            { _.map(this.state.cards, (x) => {
              return (
                <OrganizationCard key={`organizations-page-${x.name}-${x.index}`}
                  avatar={<Avatar size={30}>{x.name.charAt(0)}</Avatar>}
                  card={x}
                  handleOnClose={this.handleRemoveCard.bind(this)}
                />
            )})
            }
          </div>
        </div>
      </div>
    )
  }
}
