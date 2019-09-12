import axios from 'axios';
import { BACKEND_URL, AWS_ERROR_PATH } from './config';
import { interceptErrors } from './AxiosErrorInterceptor';
import { noCache } from './headers';

export { AWS_ERROR_PATH } from './config';

const baseAxiosConfig = {
  headers: { ...noCache },
  baseURL: BACKEND_URL,
};


export const putErrorMessage = data => axios({
  ...baseAxiosConfig, url: AWS_ERROR_PATH, method: 'put', data,
});

const axiosInstance = axios.create(baseAxiosConfig);
const axiosLogErrors = interceptErrors(axiosInstance, putErrorMessage);


export const fetchCommuteFromTo = params => axiosLogErrors({
  url: '/api/google-distance/', method: 'get', params,
});

export const fetchAutocompleteSuggestion = params => axiosLogErrors({
  url: '/api/google-places-ac/', method: 'get', params,
});
