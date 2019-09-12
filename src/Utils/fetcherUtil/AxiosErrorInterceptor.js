import ReactGA from 'react-ga';
import { CONF_NAME } from '../../Constants';
import { AWS_ERROR_PATH } from './config';


export const httpErrorHandler = consumer => (error) => {
  const {
    config: { url: path },
  } = error;

  let label;

  // Reject if path is same as awsErrorUrl
  // otherwise we can create an infinite loop
  if (path === AWS_ERROR_PATH) {
    return Promise.reject(error);
  }

  if (error.response) {
    const {
      response: { status, statusText },
    } = error;
    label = `${path} ${status} ${statusText}`;
  } else {
    label = `${path} ${error.message}`;
  }

  const errorMessage = {
    errorOrigin: `Admin${CONF_NAME}`,
    label,
  };

  ReactGA.event({
    category: 'ERROR',
    action: 'HTTP_ADMIN',
    label,
    nonInteraction: true,
  });

  consumer(errorMessage).then((response) => {
    if (response.status === 200) {
      console.log('success');
    }
  }).catch((er) => {
    console.log('error', er);
  });

  return Promise.reject(error);
};

export const interceptErrors = (axios, consumer) => {
  axios.interceptors.response.use(
    response => response,
    httpErrorHandler(consumer),
  );
  return axios;
};
