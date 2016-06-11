import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react';
import {connect} from 'react-redux';

import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';

import ProjectCard from './cards/project-card'
import ProjectList from './cards/project-list'

@connect(state => ({
  projects: state.projects.projects
}))
export default class ProjectsPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      cards: []  //{project: $project, order: $index }
    }
  }

  handleAddCard = (name) => {
    const nextIndex = this.state.cards.length + 1
    this.setState({
      cards: this.state.cards.concat({index: nextIndex, name})
    })
  }

  handleRemoveCard = (index) => {
    console.info("handleRemoveCard", index)
    this.setState({
      cards: _.reject(this.state.cards, x => x.index === index )
    })
  }

  render() {
    console.info("ProjectsPage:render")
    if (!process.browser || _.isEmpty(this.props.projects)) return null
    return (
      <div id="projects-page" className="flex-row-content">
        <div style={{flexGrow: 0, alignSelf: 'stretch'}}>
          <ProjectList projects={this.props.projects}  onClick={this.handleAddCard.bind(this)} />
        </div>
        <div style={{flexGrow: 1}}>
          <div id="project-cards-content" className="project-card">
            { _.map(this.state.cards, (x) => {
              return (
                <ProjectCard key={`projects-page-${x.name}-${x.index}`}
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
