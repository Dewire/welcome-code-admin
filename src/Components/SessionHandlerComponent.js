/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import jwt from 'jsonwebtoken';
import { CognitoAuth } from 'amazon-cognito-auth-js/dist/amazon-cognito-auth';
import { setUserAuth, setAuthObject, setUser } from '../Actions/SessionActions';
import { URL_TYPES, COGNITO_APP_CLIENT_ID, COGNITO_APP_CLIENT_DOMAIN_NAME } from '../Constants';

const setSessionCookie = (session) => {
  const splittedHostStr = document.location.hostname.split('.');
  const domain = splittedHostStr.length > 1 ?
    `${splittedHostStr[splittedHostStr.length - 2]}.${splittedHostStr[splittedHostStr.length - 1]}`
    :
    document.location.hostname;
  document.cookie = `jwtToken=${session};path=/;domain=${domain}`;
};

class ExtendedCognitoAuth extends CognitoAuth {
  launchUri(URL) {
    if (this.userhandler.onLogin()) {
      super.launchUri(URL);
    }
  }
}

class SessionHandlerComponent extends Component {
  componentDidMount() {
    this.onload();
  }

  onload() {
    const { dispatch } = this.props;
    const auth = this.initCognitoSDK();
    const curUrl = window.location.href;

    if (curUrl.includes('code')) {
      auth.parseCognitoWebResponse(curUrl);
    } else {
      auth.getSession();
      dispatch(setAuthObject(auth));
    }

    if (this.props.match) {
      if (this.props.match.path.endsWith(`${URL_TYPES.LOGOUT}`)) {
        localStorage.setItem('callbackLanguage', this.props.match.params.lang);
        localStorage.setItem('callbackMunicipality', this.props.match.params.municipalityName);
        setSessionCookie(undefined);
        auth.signOut();
      }
    }
  }

  initCognitoSDK() {
    const {
      path, computedMatch: {
        params: {
          lang,
          municipalityName,
        },
      } = {
        params: {},
      },
    } = this.props;

    const authData = {
      ClientId: COGNITO_APP_CLIENT_ID,
      AppWebDomain: COGNITO_APP_CLIENT_DOMAIN_NAME,
      TokenScopesArray: ['openid', 'email'],
      RedirectUriSignIn: `${window.location.origin}/login`,
      RedirectUriSignOut: `${window.location.origin}/login`,
    };

    const auth = new ExtendedCognitoAuth(authData);

    auth.userhandler = {
      onLogin: () => {
        if (path && path.endsWith(`${URL_TYPES.START}`)) {
          localStorage.setItem('callbackLanguage', lang);
          localStorage.setItem('callbackMunicipality', municipalityName);
        }
        return true;
      },
      onSuccess: (result) => {
        this.signedIn(result);
        auth.setUser(auth.getCurrentUser());
      },
      onFailure: (err) => {
        console.log(`Error!${err}`);
      },
    };
    auth.useCodeGrantFlow();

    return auth;
  }

  signedIn(session) {
    const { dispatch } = this.props;
    if (session) {
      const idToken = session.getIdToken().getJwtToken();
      const decoded = jwt.decode(idToken);
      setSessionCookie(session.idToken.jwtToken);
      dispatch(setUser(decoded.email));
    }
    dispatch(setUserAuth(true));
  }

  redirectRoute() {
    const { location } = this.props;
    if (location) {
      return location.pathname;
    }
    return '/'; // NOTE: Redirect to PATH_PREFIX instead?
  }

  render() {
    const nextRoute = this.redirectRoute();
    const { sessionReducer: { userAuth } } = this.props;
    return (
      userAuth &&
      <Redirect to={nextRoute} />
    );
  }
}

const mapStateToProps = state => ({
  languageReducer: state.LanguageReducer,
  municipalityReducer: state.MunicipalityReducer,
  sessionReducer: state.SessionReducer,
});

export default connect(mapStateToProps)(SessionHandlerComponent);
