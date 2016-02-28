import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Picker from './picker';
import GitStatsCharts from './git-stats-charts';

// import { SimpleSelect } from 'react-selectize';
import Select from 'react-select'

const REPOS = require('../../config.json').repos
const BRANCHES = ['master'];

class GitStats extends Component {

  constructor(props) {
    super(props);
    this.handleRepoChange = this.handleRepoChange.bind(this);
    this.handleBranchChange = this.handleBranchChange.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
  }

  componentDidMount() {
    const { selectedOdlRepo, selectedBranchName } = this.props;
    this.props.fetchBranchesIfNeeded(selectedOdlRepo);
    this.props.fetchGitCommitsIfNeeded(selectedOdlRepo, selectedBranchName);
  }

  componentWillReceiveProps(nextProps) {
    // console.log("componentWillReceiveProps", nextProps);
    if (nextProps.selectedOdlRepo !== this.props.selectedOdlRepo) {
      const { selectedOdlRepo, selectedBranchName } = nextProps;
      this.props.fetchBranchesIfNeeded(selectedOdlRepo);
      this.props.fetchGitCommitsIfNeeded(selectedOdlRepo, selectedBranchName);
    }
  }

  handleRepoChange(repo) {
    this.props.selectOdlRepo(repo, this.props.selectedBranchName);
    this.props.fetchBranches(repo);
  }

  handleBranchChange(branchName) {
    this.props.selectOdlRepo(this.props.selectedOdlRepo, branchName);
    this.props.selectBranchName(branchName);
    this.props.fetchGitCommitsIfNeeded(this.props.selectedOdlRepo, branchName);
  }

  handleRefreshClick(e) {
    e.preventDefault();
    const { selectedOdlRepo, selectedBranchName } = this.props;
    this.props.invalidateGitCommits(selectedOdlRepo, selectedBranchName);
    this.props.fetchGitCommitsIfNeeded(selectedOdlRepo, selectedBranchName);
  }

  render () {
    const { selectedOdlRepo, selectedBranchName, gitCommits, branches, isFetching, lastUpdated, error } = this.props;
    // console.log("isFetching:", isFetching);
    // const renderSelectRepo = () => {
    //   let options = REPOS.map( (x) => {return { label:x, value: x} });
    //   return (
    //     <SimpleSelect
    //       ref="selectOdlRepo" placeholder="Select Repo" theme="material"
    //       options={options} value={selectedOdlRepo} onValueChange={this.handleRepoChange}>
    //       defaultValue={{label: 'toolkit', value: 'toolkit'}}
    //     </SimpleSelect>
    //   )
    // };

    const renderSelectRepo = () => {
      let options = REPOS.map( (x) => {return { label:x, value: x} });
      return (
        <Select
          ref="selectOdlRepo" placeholder="Select Repo"
          options={options} value={selectedOdlRepo} onChange={this.handleRepoChange}>
        </Select>
      )
    }

    return (
      <div>
        <h2>Git Stats</h2>
        <div>
          <span><Picker value={selectedOdlRepo} onChange={this.handleRepoChange} label="Select Repo" options={REPOS} /></span>
          <span><Picker value={selectedBranchName} onChange={this.handleBranchChange} label="Select Branch" options={branches} /></span>
        </div>
        <p className="post-tag">
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.{' '}
            </span>
          }
          {!isFetching && <a href='#' onClick={this.handleRefreshClick}> Refresh </a> }
        </p>
        {isFetching && gitCommits.length === 0 && <h3>Waiting for data...</h3> }
        {!isFetching && error && gitCommits.length === 0 && <div className="post-error">Data unavailable for the specified repository and branch.</div> }
        {!isFetching && !error && gitCommits.length === 0 && <h3>Empty</h3> }
        {gitCommits.length > 0 &&
          <div style={{ opacity: isFetching ? 0.5 : 1 }}>
            <GitStatsCharts gitCommits={gitCommits} />
          </div>
        }
      </div>
    );
  }
}

GitStats.propTypes = {
  selectedOdlRepo: PropTypes.string.isRequired,
  selectedBranchName: PropTypes.string.isRequired,
  gitCommits: PropTypes.array.isRequired,
  branches: PropTypes.array.isRequired,
  error: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number
};

export default GitStats;
