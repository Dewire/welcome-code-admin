import { ACTION_TYPES } from '../Constants';

const reducer = (state = {}, action) => {
  switch (action.type) {
    case ACTION_TYPES.RECEIVE_ABOUT_MUNICAPALITY_DATA:
      return {
        ...state,
        ...action.data,
      };
    default:
      return state;
  }
};

export default reducer;
