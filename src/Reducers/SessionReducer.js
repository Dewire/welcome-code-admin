const reducer = (state = { userAuth: false }, action) => {
  switch (action.type) {
    case 'SET_AUTH_OBJECT':
      return {
        ...state,
        authObject: action.authObject,
      };
    case 'SET_USER_AUTH':
      return {
        ...state,
        userAuth: action.userAuth,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.user,
      };
    case 'SET_LOGIN':
      return {
        ...state,
        loginAttempt: action.attempt,
      };
    case 'LOGOUT_USER':
      return {
        ...state,
        authObject: null,
        user: '',
        userAuth: false,
      };
    default:
      return state;
  }
};

export default reducer;
