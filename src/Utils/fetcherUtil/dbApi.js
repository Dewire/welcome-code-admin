import axios from 'axios';
import { DB_API } from './config';
import { interceptErrors } from './AxiosErrorInterceptor';
import { putErrorMessage } from './baseApi';
import { noCache, auth } from './headers';

const baseConfig = {
  baseURL: DB_API,
};

const axiosInstance = interceptErrors(axios.create(baseConfig), putErrorMessage);

export const fetchAboutService = () => axiosInstance({
  headers: { ...noCache }, url: '/about-service/', method: 'get',
});

export const fetchAboutMunicipality = municipality => axiosInstance({
  headers: { ...noCache, ...auth() }, url: `/aboutmunicipality/${municipality}`, method: 'get',
});

export const putAboutMunicipality = (municipalityId, data, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: `/aboutmunicipality/${municipalityId}/`, method: 'put', data,
});

export const getMunicipality = (municipality, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: `/municipality/${municipality}/`, method: 'get',
});

export const getAllMunicipality = jwtToken => axiosInstance({
  headers: { Authorization: jwtToken }, url: '/municipality/', method: 'get',
});

export const fetchMunicipalityData = (language, municipality) => axiosInstance({
  headers: { ...noCache, ...auth() }, url: `/municipality/${municipality}/`, method: 'get',
});

export const putMunicipality = (municipality, data, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: `/municipality/${municipality}/`, method: 'put', data,
});

export const updateMapCredentials = (municipality, data, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: `/municipality/${municipality}/mapcredentials`, method: 'put', data,
});

export const fetchAreasInMunicipality = municipalityId => axiosInstance({
  headers: { ...noCache, ...auth() }, url: `/area/${municipalityId}/`, method: 'get',
});

export const fetchAreasByMunicipalityName = municipality => axiosInstance({
  headers: { ...noCache, ...auth() }, url: `/area/municipality/${municipality}/`, method: 'get',
});

export const putArea = (municipalityId, data, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: `/area/${municipalityId}/`, method: 'put', data,
});

export const fetchAreaOverview = areaId => axiosInstance({
  headers: { ...noCache, ...auth() }, url: `/area-overview/areaid/${areaId}/`, method: 'get',
});

export const deleteArea = (municipalityId, data, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: `/area/${municipalityId}/`, method: 'delete', data,
});
