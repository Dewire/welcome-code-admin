import { ACTION_TYPES } from '../Constants';

const reducer = (state = {}, action) => {
  switch (action.type) {
    case ACTION_TYPES.RECEIVE_AREAS_IN_MUNICIPALITY:
      return {
        ...state,
        areas: action.data,
      };
    default:
      return state;
  }
};

export default reducer;
