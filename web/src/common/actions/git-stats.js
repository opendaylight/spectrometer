import request from 'axios';

export const SELECT_ODLREPO = 'SELECT_ODLREPO';
export const SELECT_BRANCHNAME = 'SELECT_BRANCHNAME';

export const INVALIDATE_GIT_COMMITS = 'INVALIDATE_GIT_COMMITS';
export const SET_GIT_COMMITS = 'SET_GIT_COMMITS';
export const SET_GIT_COMMITS_REQUEST = 'SET_GIT_COMMITS_REQUEST';
export const SET_GIT_COMMITS_SUCCESS = 'SET_GIT_COMMITS_SUCCESS';
export const SET_GIT_COMMITS_FAILURE = 'SET_GIT_COMMITS_FAILURE';

export const SET_BRANCHES = 'SET_BRANCHES';
export const SET_BRANCHES_REQUEST = 'SET_BRANCHES_REQUEST';
export const SET_BRANCHES_SUCCESS = 'SET_BRANCHES_SUCCESS';
export const SET_BRANCHES_FAILURE = 'SET_BRANCHES_FAILURE';

export function selectOdlRepo(odlRepo, branchName = 'master') {
  return {
    type: SELECT_ODLREPO,
    odlRepo,
    branchName
  };
}

export function invalidateGitCommits(odlRepo, branchName) {
  return {
    type: INVALIDATE_GIT_COMMITS,
    odlRepo,
    branchName
  };
}

export function fetchGitCommits(odlRepo = 'aaa', branchName = 'master') {
  console.log("fetchGitCommits", odlRepo, branchName)
  return {
    type: SET_GIT_COMMITS,
    odlRepo,
    branchName,
    promise: request.get(`http://localhost:8000/git/commits/${odlRepo}/${branchName}`)
  }
}

function shouldFetchGitCommits(state, odlRepo, branchName) {
  const gitCommits = state.gitCommitsByRepo[odlRepo+':'+branchName];
  if (!gitCommits) {
    return true;
  } else if (gitCommits.isFetching) {
    return false;
  } else {
    return gitCommits.didInvalidate;
  }
}


export function fetchGitCommitsIfNeeded(odlRepo, branchName) {
  return (dispatch, getState) => {
    if (shouldFetchGitCommits(getState(), odlRepo, branchName)) {
      console.log("fetchGitCommitsIfNeeded:", odlRepo, branchName)
      return dispatch(fetchGitCommits(odlRepo, branchName));
    }
  };
}

export function selectBranchName(branchName = 'master') {
  return {
    type: SELECT_BRANCHNAME,
    branchName
  };
}

export function fetchBranches(odlRepo = 'aaa') {
  return {
    type: SET_BRANCHES,
    odlRepo,
    promise: request.get(`http://localhost:8000/git/branches/${odlRepo}`)
  }
}

function shouldFetchBranches(state, odlRepo) {
  const branches = state.branchesByRepo[odlRepo];
  if (!branches) {
    return true;
  } else if (branches.isFetching) {
    return false;
  } else {
    return branches.didInvalidate;
  }
}

export function fetchBranchesIfNeeded(odlRepo) {
  return (dispatch, getState) => {
    if (shouldFetchBranches(getState(), odlRepo)) {
      console.log("fetchBranchesIfNeeded:", odlRepo)
      return dispatch(fetchBranches(odlRepo));
    }
  };
}
