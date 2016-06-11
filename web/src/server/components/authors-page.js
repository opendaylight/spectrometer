import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'
import {connect} from 'react-redux'

import * as DataReducers from '../api/data-reducers'
import Avatar from 'material-ui/Avatar'
import FontIcon from 'material-ui/FontIcon'
import AuthorCard from './cards/author-card'
import AuthorList from './cards/author-list'

@connect(state => ({
  projects: state.projects.projects
}))
export default class AuthorsPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cards: []  //{author: $author, order: $index }
    }
  }

  handleAddCard = (author) => {
    const maxIndex = this.state.cards.length + 1
    this.setState({
      cards: this.state.cards.concat({index: maxIndex, name: author})
    })
  }

  handleRemoveCard = (index) => {
    this.setState({
      cards: _.reject(this.state.cards, x => x.index === index )
    })
  }

  render() {
    if (!process.browser || _.isEmpty(this.props.projects)) return null
    console.info("authors-page:render")
    const master = DataReducers.filterMasterProjects(this.props.projects)

    return (
      <div id="authors-page" className="flex-row-content">
        <div style={{flexGrow: 0, alignSelf: 'stretch'}}>
          <AuthorList projects={master} onClick={this.handleAddCard.bind(this)} />
        </div>
        <div style={{flexGrow: 1}}>
          <div id="author-cards-content" className="project-card">
            { _.map(this.state.cards, (x) => {
              return (
                <AuthorCard key={`authors-page-${x.name}-${x.index}`}
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
