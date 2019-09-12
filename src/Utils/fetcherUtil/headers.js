import { store } from '../../Store';

export const noCache = {
  Expires: '0',
  'cache-control': 'no-cache,no-store,must-revalidate,max-age=-1,private',
  // Pragma: 'no-cache',
};

export const auth = () => {
  const {
    SessionReducer: {
      authObject: {
        signInUserSession: { idToken: { jwtToken } = {} } = {},
      } = {},
    } = {},
  } = store.getState();

  return { Authorization: jwtToken };
};
