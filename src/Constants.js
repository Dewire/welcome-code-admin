export const ACTION_TYPES = {
  RECEIVE_MUNICAPALITY_DATA: 'RECEIVE_MUNICAPALITY_DATA',
  CHANGE_LANGUAGE: 'CHANGE_LANGUAGE',
  SET_MAP_VALUES: 'SET_MAP_VALUES',
  CHANGE_LANGUAGE_VISIBILITY: 'CHANGE_LANGUAGE_DROPDOWN',
  RECEIVE_AREAS_IN_MUNICIPALITY: 'RECEIVE_AREAS_IN_MUNICIPALITY',
  RECEIVE_AREA_OVERVIEW_DATA: 'RECEIVE_AREA_OVERVIEW_DATA',
  SET_NAV_BAR_OPTION: 'SET_NAV_BAR_OPTION',
  SET_LOADING_INDICATOR: 'SET_LOADING_INDICATOR',
  SET_SHOW_SUCCESS_TOAST: 'SET_SHOW_SUCCESS_TOAST',
  RECEIVE_ABOUT_MUNICAPALITY_DATA: 'RECEIVE_ABOUT_MUNICAPALITY_DATA',
};

export const SECTION_TYPE = {
  TEXT: 'TEXT',
  IMAGES: 'IMAGES',
  VIDEO: 'VIDEO',
  DISTANCE_TABLE: 'DISTANCE_TABLE',
  STREET_VIEW: 'STREET_VIEW',
  COMMUTE_TIME: 'COMMUTE_TIME',
  HOUSE_LISTINGS: 'HOUSE_LISTINGS',
};

export const URL_TYPES = {
  ABOUT_MUNICIPALITY: 'about',
  ABOUT_SERVICE: 'about-service',
  MUNICIPALITY_OVERVIEW: 'overview',
  CONTACT: 'contact',
  MAP_STATE: 'map',
  AREAS: 'areas',
  AREA: 'area',
  START: 'start',
  MEDIA: 'media',
  SETTINGS: 'settings',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ADMIN: 'admin',
  MUNICIPALITY: 'municipality',
  NEW: 'new',
};

export const HOUSING_TYPES = {
  HOUSE: 2,
  APARTMENT: 1,
};

export const DISTANCE_TABLE_DESTINATIONS = [
  { name: 'Umeå', coordinates: { lat: 63.827861, long: 20.259566 } },
  { name: 'Vemdalen', coordinates: { lat: 62.452268, long: 13.839818 } },
  { name: 'Åre', coordinates: { lat: 63.407282, long: 13.074386 } },
  { name: 'Stockholm', coordinates: { lat: 59.331756, long: 18.079954 } },
  { name: 'Göteborg', coordinates: { lat: 57.720647, long: 11.964733 } },
  { name: 'Malmö', coordinates: { lat: 55.599818, long: 13.001769 } },
];

export const DISTANCE_API_CALL_TYPES = { AREA_CARD: 1, FILTER: 2 };

// TODO get from REACT_APP_PUBLIC_URL
export const PATH_PREFIX = ''; // If the application isn't deployed in the root

const {
  REACT_APP_AWS_COGNITO_APP_CLIENT_ID,
  REACT_APP_AWS_DOMAIN_NAME,
  REACT_APP_ENV,
  REACT_APP_AWS_REGION,
  REACT_APP_BUCKET_NAME,
  REACT_APP_FRONTEND_URL,
} = process.env;

export const COGNITO_APP_CLIENT_ID = REACT_APP_AWS_COGNITO_APP_CLIENT_ID;
export const COGNITO_APP_CLIENT_DOMAIN_NAME = REACT_APP_AWS_DOMAIN_NAME;
export const BUCKET_URL = `https://s3-${REACT_APP_AWS_REGION}.amazonaws.com/${REACT_APP_BUCKET_NAME}/`;
export const BUCKET_NAME = REACT_APP_BUCKET_NAME;
export const FRONTEND_URL = REACT_APP_FRONTEND_URL;

export const CONF_NAME = REACT_APP_ENV || 'dev';
export const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GA_ID;
