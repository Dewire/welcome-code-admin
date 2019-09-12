import { ACTION_TYPES } from '../Constants';
import { setLoadingIndicator } from './ToggleActions';
import { fetchAboutMunicipality } from '../Utils/fetcherUtil';

export const receiveAboutMunicipalityData = data => (
  { type: ACTION_TYPES.RECEIVE_ABOUT_MUNICAPALITY_DATA, data }
);

export const getAboutMunicipality = municipality => (dispatch) => {
  dispatch(setLoadingIndicator(true));
  fetchAboutMunicipality(municipality).then((response) => {
    if (response.status === 200) {
      dispatch(receiveAboutMunicipalityData(response.data));
      dispatch(setLoadingIndicator(false));
    }
  }).catch((error) => {
    console.log('error', error);
  });
};
