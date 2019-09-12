export const setAuthObject = authObject => ({ type: 'SET_AUTH_OBJECT', authObject });
export const setUserAuth = userAuth => ({ type: 'SET_USER_AUTH', userAuth });
export const setUser = user => ({ type: 'SET_USER', user });
export const logout = () => ({ type: 'LOGOUT_USER' });
