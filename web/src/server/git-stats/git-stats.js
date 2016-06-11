import axios from 'axios';

export const SET_ALL_PROJECTS = 'SET_ALL_PROJECTS'
export const SET_PROJECT_COMMITS = 'SET_PROJECT_COMMITS'
export const SET_PROJECT_COMMITS_SINCE_REF = 'SET_PROJECT_COMMITS_SINCE_REF'
export const SET_PROJECT_AUTHORS = 'SET_PROJECT_AUTHORS'

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

function getInitialState() {
  return {
    isFetching: false,
    isError: false,
    projects: []
  }
}

export default function(state = {}, action) {
  // console.info('git-stats:reducer:action', action)
  // console.info('git-stats:reducer:previous state', state)

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

    default:
      // console.info("git-stats:reducer:new state", state)
      return state
  }
}
