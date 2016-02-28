import { bindActionCreators } from 'redux';
import React, { Component} from 'react';
import { connect } from 'react-redux';

import GitStats from './git-stats';
import * as GitStatsActions from '../actions/git-stats';

//Data that needs to be called before rendering the component
//This is used for server side rending via the fetchComponentDataBeforeRending() method
GitStats.need = [
  GitStatsActions.fetchGitCommits
  // GitStatsActions.fetchBranches
]

function mapStateToProps(state) {
  // console.log("STATE", state);
  let { selectedOdlRepo, selectedBranchName, gitCommitsByRepo, branchesByRepo } = state;
  const {
    isFetching,
    lastUpdated,
    error,
    gitCommits
  } = gitCommitsByRepo[selectedOdlRepo + ':' + selectedBranchName] || {
    isFetching: true,
    error:{},
    gitCommits: []
  };

  // console.log("mapStateToProps", selectedOdlRepo, selectedBranchName, isFetching);
  return {
    selectedOdlRepo,
    // branchName: branchName || 'master',
    selectedBranchName,
    gitCommits,
    branches: branchesByRepo[selectedOdlRepo] ? branchesByRepo[selectedOdlRepo].branches : ['master'],
    isFetching,
    lastUpdated,
    error
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GitStatsActions, dispatch);
}

export default connect(mapStateToProps,mapDispatchToProps)(GitStats);
