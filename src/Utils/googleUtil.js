import { fetchCommuteFromTo, fetchAutocompleteSuggestion } from './fetcherUtil';

const AC_PLACES_RADIUS = 10000;
const AC_PLACES_COMPONENTS = 'country:se';

export const getDistanceObj = (origin, placeId, destination, type, key, language) =>
  new Promise(async (resolve, reject) => {
    if (!type) {
      reject(new Error('Specify DISTANCE_API_CALL_TYPE'));
    } else {
      fetchCommuteFromTo({
        origins: origin,
        placeId,
        destinations: destination,
        units: 'metric',
        key,
        language,
        type,
      }).then((resp) => {
        // TODO: Maybe switch to moment.js and use duration in milliseconds from resp
        Object.keys(resp.data).forEach((o) => {
          if (language === 'sv') {
            resp.data[o] = resp.data[o].replace('timmar', 'h');
            resp.data[o] = resp.data[o].replace('tim', 'h');
          } else if (language === 'en') {
            resp.data[o] = resp.data[o].replace('hours', 'h');
            resp.data[o] = resp.data[o].replace('hour', 'h');
          }
        });
        resolve(resp.data);
      }).catch((err) => {
        reject(err);
      });
    }
  });

export const getAutocompletePlacesSuggestion = (origin, input, key, language) =>
  new Promise(async (resolve, reject) => {
    if (!input) {
      resolve('');
    }

    fetchAutocompleteSuggestion({
      input,
      key,
      language,
      location: `${origin.lat},${origin.long}`,
      radius: AC_PLACES_RADIUS,
      components: AC_PLACES_COMPONENTS,
    }).then((resp) => {
      resolve(resp.data);
    }).catch((err) => {
      reject(err);
    });
  });
