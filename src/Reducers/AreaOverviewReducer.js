import { ACTION_TYPES } from '../Constants';

const reducer = (state = {}, action) => {
  switch (action.type) {
    case ACTION_TYPES.RECEIVE_AREA_OVERVIEW_DATA:
      return {
        ...state,
        areaOverview: action.data,
      };
    default:
      return state;
  }
};

export default reducer;
