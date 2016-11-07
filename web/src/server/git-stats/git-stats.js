/**
# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2016 The Linux Foundation and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################
*/

/**
 * Redux Reducer for Git Statistics
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import axios from 'axios';
import logger from '../logger'

export const SET_ALL_PROJECTS = 'SET_ALL_PROJECTS'
export const SET_PROJECT_COMMITS = 'SET_PROJECT_COMMITS'
export const SET_PROJECT_COMMITS_SINCE_REF = 'SET_PROJECT_COMMITS_SINCE_REF'
export const SET_PROJECT_AUTHORS = 'SET_PROJECT_AUTHORS'

export const PROJECTS_PAGE_ADD_CARD = 'PROJECTS_PAGE_ADD_CARD'
export const PROJECTS_PAGE_REMOVE_CARD = 'PROJECTS_PAGE_REMOVE_CARD'
export const PROJECTS_PAGE_REMOVE_CARDS = 'PROJECTS_PAGE_REMOVE_CARDS'

export const ORGANIZATIONS_PAGE_ADD_CARD = 'ORGANIZATIONS_PAGE_ADD_CARD'
export const ORGANIZATIONS_PAGE_REMOVE_CARD = 'ORGANIZATIONS_PAGE_REMOVE_CARD'
export const ORGANIZATIONS_PAGE_REMOVE_CARDS = 'ORGANIZATIONS_PAGE_REMOVE_CARDS'

export const AUTHORS_PAGE_ADD_CARD = 'AUTHORS_PAGE_ADD_CARD'
export const AUTHORS_PAGE_REMOVE_CARD = 'AUTHORS_PAGE_REMOVE_CARD'
export const AUTHORS_PAGE_REMOVE_CARDS = 'AUTHORS_PAGE_REMOVE_CARDS'

export function setAllProjects() {
  return (dispatch) => {
    axios.get('/spectrometer-api/gerrit/projects')
      .then(function(response) {
        dispatch({
          type: SET_ALL_PROJECTS,
          data: response.data
        })
    })
  }
}

export function setProjectCommitsSinceRef(project, ref1='master', ref2 = 'master') {
  const url = ref1 === ref2 ?
    `/spectrometer-api/git/commits?project=${project}&branch=${ref1}` :
    `/spectrometer-api/git/commits_since_ref?project=${project}&ref1=${ref1}&ref2=${ref2}`

  return (dispatch) => {
    axios.get(url)
      .then(function(response) {
        dispatch({
          type: SET_PROJECT_COMMITS_SINCE_REF,
          name: project,
          ref1,
          ref2,
          commits: response.data.commits
        })
    })
  }
}

export function setProjectAuthors(project, branch='master') {
  return (dispatch) => {
    axios.get(`/spectrometer-api/git/authors?project=${project}`)
      .then(function(response) {
        dispatch({
          type: SET_PROJECT_AUTHORS,
          name: project,
          data: response.data
        })
    })
  }
}

/** add a new project card **/
export function projectsPageAddCard(name) {
  return {
    type: PROJECTS_PAGE_ADD_CARD,
    name
  }
}

/** remove a particular card **/
export function projectsPageRemoveCard(name, index) {
  return {
    type: PROJECTS_PAGE_REMOVE_CARD,
    name,
    index
  }
}

/** remove all cards of that project **/
export function projectsPageRemoveCards(name) {
  return {
    type: PROJECTS_PAGE_REMOVE_CARDS,
    name
  }
}

/** add a new organization card **/
export function organizationsPageAddCard(name) {
  return {
    type: ORGANIZATIONS_PAGE_ADD_CARD,
    name
  }
}

/** remove a particular card **/
export function organizationsPageRemoveCard(name, index) {
  return {
    type: ORGANIZATIONS_PAGE_REMOVE_CARD,
    name,
    index
  }
}

/** remove all cards of that project **/
export function organizationsPageRemoveCards(name) {
  return {
    type: ORGANIZATIONS_PAGE_REMOVE_CARDS,
    name
  }
}
/** add a new project card **/
export function authorsPageAddCard(name) {
  return {
    type: AUTHORS_PAGE_ADD_CARD,
    name
  }
}

/** remove a particular card **/
export function authorsPageRemoveCard(name, index) {
  return {
    type: AUTHORS_PAGE_REMOVE_CARD,
    name,
    index
  }
}

/** remove all cards of that project **/
export function authorsPageRemoveCards(name) {
  return {
    type: AUTHORS_PAGE_REMOVE_CARDS,
    name
  }
}

/**
 * Reducer function
 */
export default function(state = {}, action) {
  logger.info('git-stats:reducer:action', action)

  switch (action.type) {
    case SET_ALL_PROJECTS: {
      state = Object.assign({}, state, { projects: action.data.projects })
      return {...state}
    }

    case SET_PROJECT_COMMITS: {
      const existing = _.find(state.projects, (p) => { return p.name === action.name && p.ref1 === action.ref1 && p.ref2 === action.ref2} )
      if (!existing) {
        let p0 = { name: action.name,  commits: action.data.commits  }
        state = Object.assign({}, state, {
          projects: state.projects.concat(p0)
        })
      }
      return {...state}
    }

    case SET_PROJECT_COMMITS_SINCE_REF: {
      const existing = _.find(state.projects, (p) => { return p.name === action.name && p.ref1 === action.ref1 && p.ref2 === action.ref2} )
      if (!existing) {
        let p1 = { name: `${action.name}`,  ref1: action.ref1, ref2: action.ref2, commits: action.commits  }
        state = Object.assign({}, state, {
          projects: state.projects.concat(p1)
        })
      }
      return {...state}
    }

    case PROJECTS_PAGE_ADD_CARD: {
      state = Object.assign({}, state, {
        projectCards: [...state.projectCards, {index: state.projectCards.length + 1, name: action.name}]
      })
      return {...state}
    }

    case PROJECTS_PAGE_REMOVE_CARD: {
      state = Object.assign({}, state, {
        projectCards: _.reject(state.projectCards, x => x.index === action.index)
      })
      return {...state}
    }

    case PROJECTS_PAGE_REMOVE_CARDS: {
      state = Object.assign({}, state, {
        projectCards: _.reject(state.projectCards, x => x.name === action.name)
      })
      return {...state}
    }

    case ORGANIZATIONS_PAGE_ADD_CARD: {
      state = Object.assign({}, state, {
        organizationCards: [...state.organizationCards, {index: state.organizationCards.length + 1, name: action.name}]
      })
      return {...state}
    }

    case ORGANIZATIONS_PAGE_REMOVE_CARD: {
      state = Object.assign({}, state, {
        organizationCards: _.reject(state.organizationCards, x => x.index === action.index)
      })
      return {...state}
    }

    case ORGANIZATIONS_PAGE_REMOVE_CARDS: {
      state = Object.assign({}, state, {
        organizationCards: _.reject(state.organizationCards, x => x.name === action.name)
      })
      return {...state}
    }

    case AUTHORS_PAGE_ADD_CARD: {
      state = Object.assign({}, state, {
        authorCards: [...state.authorCards, {index: state.authorCards.length + 1, name: action.name}]
      })
      return {...state}
    }

    case AUTHORS_PAGE_REMOVE_CARD: {
      state = Object.assign({}, state, {
        authorCards: _.reject(state.authorCards, x => x.index === action.index)
      })
      return {...state}
    }

    case AUTHORS_PAGE_REMOVE_CARDS: {
      state = Object.assign({}, state, {
        authorCards: _.reject(state.authorCards, x => x.name === action.name)
      })
      return {...state}
    }

    default:
      return state
  }
}
