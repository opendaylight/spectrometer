import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react';
import {connect} from 'react-redux';

import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'


export default class GameCard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      score: 0,
      questions: 0,
      correct: 0
    }
  }

  render() {
    return (
      <PaperLayout id="game" title="Game" titleClassName="recently"
        avatar={<Avatar icon={<FontIcon className="material-icons">game</FontIcon>} size={30}></Avatar>}>
        <List>
          {
            _.map(recentCommits, (x, index) => {
              return (<ListItem key={`${x.name}-${index}`}
                primaryText={`${x.commits[0].author} committed ${moment(x.commits[0].authored_date*1000).fromNow()}`}
                secondaryText={`${x.name}`}
                leftAvatar={<Avatar icon={<FontIcon className="material-icons">perm_identity</FontIcon>} size={30}></Avatar>} />)
            })
          }
        </List>
      </PaperLayout>
    )
  }
}

GameCard.propTypes = {
  projects: React.PropTypes.array.isRequired,
}
