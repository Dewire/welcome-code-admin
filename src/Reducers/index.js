import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import SessionReducer from './SessionReducer';
import LanguageReducer from './LanguageReducer';
import MunicipalityReducer from './MunicipalityReducer';
import AreaReducer from './AreaReducer';
import AreaOverviewReducer from './AreaOverviewReducer';
import ToggleReducer from './ToggleReducer';
import AboutMunicipalityReducer from './AboutMunicipalityReducer';

const reducers = combineReducers({
  SessionReducer,
  LanguageReducer,
  MunicipalityReducer,
  AreaReducer,
  AreaOverviewReducer,
  ToggleReducer,
  AboutMunicipalityReducer,
  router: routerReducer,
});

export default reducers;
