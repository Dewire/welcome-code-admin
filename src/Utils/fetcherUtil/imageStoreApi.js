import axios from 'axios';
import { IMAGE_API } from './config';

export const putImage = (municipality, data, jwtToken) => axios({
  headers: { Authorization: jwtToken }, baseURL: IMAGE_API, url: `/${municipality}/`, method: 'post', data,
});

export const deleteImage = (path, jwtToken) => axios({
  headers: { Authorization: jwtToken }, baseURL: IMAGE_API, url: `/${path}/`, method: 'delete',
});
