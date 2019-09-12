import { push } from 'react-router-redux';
import { ACTION_TYPES } from '../Constants';
import { setLoadingIndicator } from './ToggleActions';
import { fetchMunicipalityData } from '../Utils/fetcherUtil';

const receiveMunicipalityData = data => ({ type: ACTION_TYPES.RECEIVE_MUNICAPALITY_DATA, data });

export const getMunicipalityData = (lang, municipalityName) => (dispatch) => {
  fetchMunicipalityData(lang, municipalityName).then((response) => {
    dispatch(setLoadingIndicator(true));
    if (response.status === 200) {
      dispatch(receiveMunicipalityData(response.data));
      dispatch(setLoadingIndicator(false));
    }
  }).catch((error) => {
    if (error.response.status === 404) {
      dispatch(push('/404'));
    }
    console.log('error', error);
  });
};
