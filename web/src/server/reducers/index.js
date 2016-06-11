import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import projectReducer from '../git-stats/git-stats'

export default combineReducers({
  version: '1.0',
  projects: projectReducer,
  routing : routerReducer
});
