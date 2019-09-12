import { ACTION_TYPES } from '../Constants';
import { setLoadingIndicator } from './ToggleActions';
import {
  fetchAreasInMunicipality,
  fetchAreasByMunicipalityName,
} from '../Utils/fetcherUtil';

const receiveAreasInMunicipality = data => ({
  type: ACTION_TYPES.RECEIVE_AREAS_IN_MUNICIPALITY, data,
});

export const getAreasInMunicipality = municipalityId => (dispatch) => {
  dispatch(setLoadingIndicator(true));
  fetchAreasInMunicipality(municipalityId).then((response) => {
    if (response.status === 200) {
      dispatch(receiveAreasInMunicipality(response.data));
      dispatch(setLoadingIndicator(false));
    }
  }).catch((error) => {
    console.log('error', error);
  });
};

export const getAreasByMunicipalityName = municipalityName => (dispatch) => {
  dispatch(setLoadingIndicator(true));
  fetchAreasByMunicipalityName(municipalityName).then((response) => {
    if (response.status === 200) {
      dispatch(receiveAreasInMunicipality(response.data));
      dispatch(setLoadingIndicator(false));
    }
  }).catch((error) => {
    console.log('error', error);
  });
};
