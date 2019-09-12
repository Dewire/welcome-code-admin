import { ACTION_TYPES } from '../Constants';
import { fetchAreaOverview } from '../Utils/fetcherUtil';
import { setLoadingIndicator } from './ToggleActions';

export const receiveAreaOverviewData = data => (
  { type: ACTION_TYPES.RECEIVE_AREA_OVERVIEW_DATA, data }
);

export const getAreaOverview = areaId => (dispatch) => {
  dispatch(receiveAreaOverviewData('')); // Clear state on routing
  dispatch(setLoadingIndicator(true));
  fetchAreaOverview(areaId).then((response) => {
    dispatch(receiveAreaOverviewData(response.data));
    dispatch(setLoadingIndicator(false));
  });
};
