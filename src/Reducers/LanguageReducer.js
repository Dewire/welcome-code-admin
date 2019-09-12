import { ACTION_TYPES } from '../Constants';
import en from '../Resources/en';
import sv from '../Resources/sv';

const initialState = {
  language: 'sv',
  applicationText: sv,
  allText: { sv, en },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.CHANGE_LANGUAGE:
      return { ...state, language: action.language, applicationText: action.language === 'sv' ? sv : en };
    default:
      return state;
  }
};

export default reducer;
