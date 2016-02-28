import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';
import undoable from 'redux-undo';

import layout from './layout';
import version from './version';
import { selectedOdlRepo, selectedBranchName, gitCommitsByRepo, branchesByRepo } from './git-stats';

const rootReducer = combineReducers({
  version,
  layout,
  selectedOdlRepo,
  selectedBranchName,
  gitCommitsByRepo,
  branchesByRepo,
  router : routerStateReducer
});

export default rootReducer;
