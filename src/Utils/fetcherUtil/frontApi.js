import axios from 'axios';
import { FRONTEND_API } from './config';
import { noCache } from './headers';
import { interceptErrors } from './AxiosErrorInterceptor';
import { putErrorMessage } from './baseApi';

const axiosInstance = interceptErrors(axios.create({
  headers: { ...noCache },
  baseURL: FRONTEND_API,
}), putErrorMessage);

export const fetchListingsByArea = params => axiosInstance({
  headers: { ...noCache }, baseURL: FRONTEND_API, url: '/booli/listings', method: 'get', params,
});

export const fetchSoldByArea = params => axiosInstance({
  headers: { ...noCache }, baseURL: FRONTEND_API, url: '/booli/sold', method: 'get', params,
});
