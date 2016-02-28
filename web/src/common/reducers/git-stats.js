import {
  SELECT_ODLREPO, SELECT_BRANCHNAME,
  INVALIDATE_GIT_COMMITS,
  SET_GIT_COMMITS, SET_GIT_COMMITS_REQUEST, SET_GIT_COMMITS_SUCCESS, SET_GIT_COMMITS_FAILURE,
  SET_BRANCHES, SET_BRANCHES_REQUEST, SET_BRANCHES_SUCCESS, SET_BRANCHES_FAILURE
} from '../actions/git-stats';

function updateGitCommits(state = {
  error: {},
  isFetching: false,
  didInvalidate: false,
  gitCommits: []
}, action) {
  switch (action.type) {
    case INVALIDATE_GIT_COMMITS:
      return Object.assign({}, state, {
        didInvalidate: true
      });
    case SET_GIT_COMMITS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      });
    case SET_GIT_COMMITS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        selectedBranchName: action.branchName,
        gitCommits: action.gitCommits,
        lastUpdated: action.receivedAt
      });
    case SET_GIT_COMMITS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false
      });
    default:
      return state;
  }
}

function updateBranches(state = {
  error: {},
  isFetching: false,
  didInvalidate: false,
  branches: []
}, action) {
  switch (action.type) {
    case SET_BRANCHES_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        didInvalidate: false
      });
    case SET_BRANCHES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        branchName: action.branchName,
        branches: action.branches,
        lastUpdated: action.receivedAt
      });
    case SET_BRANCHES_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false
      });
    default:
      return state;
  }
}

export function selectedOdlRepo(state = 'aaa', action) {
  switch (action.type) {
  case SELECT_ODLREPO:
    return action.odlRepo //+ ':' + (action.branchName || 'master');
  default:
    return state;
  }
}

export function selectedBranchName(state = 'master', action) {
  switch (action.type) {
  case SELECT_BRANCHNAME:
    return action.branchName //+ ':' + (action.branchName || 'master');
  default:
    return state;
  }
}

export function gitCommitsByRepo(state = { }, action) {
  console.info("gitCommitsByRepo:", action.type, action.odlRepo, action.branchName)
  const repoKey = `${action.odlRepo}:${action.branchName}`
  switch (action.type) {
    case INVALIDATE_GIT_COMMITS:
    case SET_GIT_COMMITS:
    case SET_GIT_COMMITS_REQUEST:
    case SET_GIT_COMMITS_SUCCESS:
      let gitCommitsArray = [];
      if(action.req && action.req.data && action.req.data.data) {
        gitCommitsArray = action.req.data.data.commits;
      }
      return Object.assign({}, state, {
        [repoKey]: updateGitCommits(state[repoKey], {
          type: action.type,
          odlRepo: action.odlRepo,
          branchName: action.branchName,
          gitCommits: gitCommitsArray,
          receivedAt: Date.now()
        })
      });

    case SET_GIT_COMMITS_FAILURE:
      return Object.assign({}, state, {
        [repoKey]: updateGitCommits(state[repoKey], {
          type: action.type,
          odlRepo: action.odlRepo,
          branchName: action.branchName,
          gitCommits: [],
          receivedAt: Date.now(),
          error : {
            status: action.error.status,
            statusText : action.error.statusText
          }
        })
      });

    default:
      return state;
  }
}

export function branchesByRepo(state = { }, action) {
  console.info("branchesByRepo:", action.type, action.odlRepo)
  switch (action.type) {
    case SET_BRANCHES:
    case SET_BRANCHES_REQUEST:
    case SET_BRANCHES_SUCCESS:
      let branchesArray = [];
      if(action.req && action.req.data && action.req.data.data) {
        branchesArray = action.req.data.data.names;
      }
      return Object.assign({}, state, {
        [action.odlRepo]: updateBranches(state[action.odlRepo], {
          type: action.type,
          odlRepo: action.odlRepo,
          branches: branchesArray,
        })
      });

    case SET_BRANCHES_FAILURE:
      return Object.assign({}, state, {
        [action.odlRepo]: updateBranches(state[action.odlRepo], {
          type: action.type,
          odlRepo: action.odlRepo,
          branches: ['master'],
          error : {
            status: action.error.status,
            statusText : action.error.statusText
          }
        })
      });

    default:
      return state;
  }
}
