/* eslint no-mixed-operators: "off" */
/* eslint-env browser */
export const capitalize = string => (string ? string.charAt(0).toUpperCase() + string.slice(1) : '');
export const getDistanceBetweenCoordinatesKm = (c1, c2) => {
  const deg2rad = deg => deg * (Math.PI / 180);

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(c2.lat - c1.lat); // deg2rad below
  const dLon = deg2rad(c2.long - c1.long);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(c1.lat)) * Math.cos(deg2rad(c2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

export const sortAreasByDistance = (origin, areas) =>
  areas.filter(a => a.name !== origin.name).sort((x, y) =>
    getDistanceBetweenCoordinatesKm(origin.coordinates, x.coordinates)
    > getDistanceBetweenCoordinatesKm(origin.coordinates, y.coordinates));

export const isMobileDevice = () => (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

export const getGroupName = municipality => `${municipality.charAt(0).toUpperCase() + municipality.slice(1).toLowerCase()}Admin`;

// eslint-disable-next-line no-useless-escape
export const validateEmail = email => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/.test(email);

// We are not allowing theese characters as areaName since they can cause trouble in the browser
export const validateAreaName = message => () => areaName => (/[!*'();:@&=+$/?%#[\]]/.test(areaName) ? message : undefined);

export const validateLength = (message, maxLength, minLength) => () => (value) => {
  const max = maxLength || 1000;
  const min = minLength || 1;
  if (value.length > max || value.length < min) {
    if (value.length < min && value.length === 0) {
      return message.cannotBeEmpty;
    } else if (this.state.input.length < min) {
      return message.cannotBeLessThan + min + message.chars;
    }
    return message.cannotBeLongerThan + message.minLength + message.chars;
  }
  return undefined;
};
