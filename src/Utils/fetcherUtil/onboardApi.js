import axios from 'axios';
import { ONBOARD_API } from './config';
import { interceptErrors } from './AxiosErrorInterceptor';
import { putErrorMessage } from './baseApi';

const axiosInstance = interceptErrors(axios.create({
  baseURL: ONBOARD_API,
}), putErrorMessage);

export const createMunicipality = (municipality, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: `/${municipality}/`, method: 'post',
});

export const enableDisableMunicipality = (municipality, enabled, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: `/${municipality}/enable`, method: `${enabled ? 'post' : 'delete'}`,
});

export const getUsers = (userGroup, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: `/${userGroup}/users`, method: 'get',
});

export const createUser = (data, jwtToken) => axiosInstance({
  headers: { Authorization: jwtToken }, url: '/user', method: 'post', data,
});
