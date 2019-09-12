export const BACKEND_URL = process.env.REACT_APP_LAMBDA_URL;
export const MAP_BACKEND_URL = process.env.REACT_APP_MAP_PROXY_URL;
export const BASE_API = '/api';
export const AWS_ERROR_PATH = `${BASE_API}/aws/error`;
export const DB_API = `${BACKEND_URL}/db`;
export const IMAGE_API = `${BACKEND_URL}/image`;
export const FRONTEND_API = `${BACKEND_URL}/front`;
export const ONBOARD_API = `${BACKEND_URL}/onboard`;
