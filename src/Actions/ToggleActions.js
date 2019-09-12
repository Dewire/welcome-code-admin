import { ACTION_TYPES } from '../Constants';

export const setNavBarOption = option => ({
  type: ACTION_TYPES.SET_NAV_BAR_OPTION, option,
});

export const setLoadingIndicator = loading => ({
  type: ACTION_TYPES.SET_LOADING_INDICATOR, loading,
});

export const setShowSuccessToast = state => ({
  type: ACTION_TYPES.SET_SHOW_SUCCESS_TOAST, state,
});
