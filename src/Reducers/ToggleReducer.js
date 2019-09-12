import { ACTION_TYPES } from '../Constants';

const initialState = {
  selectedNavBarOption: '',
  loading: false,
  showSuccessToast: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_NAV_BAR_OPTION:
      return {
        ...state,
        selectedNavBarOption: action.option,
      };
    case ACTION_TYPES.SET_LOADING_INDICATOR:
      return {
        ...state,
        loading: action.loading,
      };
    case ACTION_TYPES.SET_SHOW_SUCCESS_TOAST:
      return {
        ...state,
        showSuccessToast: action.state,
      };
    default:
      return state;
  }
};

export default reducer;
