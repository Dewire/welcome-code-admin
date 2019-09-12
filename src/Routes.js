/* eslint-env browser */
import React from 'react';
import ReactGA from 'react-ga';
import { Route, Switch, Redirect } from 'react-router-dom';
import { store } from './Store';
import SessionHandlerComponent from './Components/SessionHandlerComponent';
import StartPageComponent from './Components/StartPageComponent';
import AreasComponent from './Components/AreasComponent';
import AreaDetailsComponent from './Components/AreaDetailsComponent';
import MapStateComponent from './Components/MapStateComponent';
import AboutMunicipalityComponent from './Components/AboutMunicipalityComponent';
import ContactComponent from './Components/ContactComponent';
import MediaLibaryComponent from './Components/MediaLibaryComponent';
import ImageUploadComponent from './Components/ImageUploadComponent';
import SettingsComponent from './Components/SettingsComponent';
import PageNotFoundComponent from './Components/PageNotFoundComponent';
import MunicipalityListComponent from './Components/Admin/MunicipalityListComponent';
import MunicipalityComponent from './Components/Admin/MunicipalityComponent';
import { changeLanguage } from './Actions/LanguageActions';
import { getMunicipalityData } from './Actions/MunicipalityActions';
import { getAboutMunicipality } from './Actions/AboutMunicipalityActions';
import { getAreasByMunicipalityName } from './Actions/AreaActions';
import { getAreaOverview, receiveAreaOverviewData } from './Actions/AreaOverviewActions';
import { setNavBarOption } from './Actions/ToggleActions';
import { URL_TYPES, PATH_PREFIX, GOOGLE_ANALYTICS_ID } from './Constants';

ReactGA.initialize(GOOGLE_ANALYTICS_ID, {
  gaOptions: {
    anonymizeIp: true,
    forceSSL: true,
  },
});

const initApp = (match) => {
  const { lang, municipalityName } = match.params;
  ReactGA.pageview(window.location.pathname + window.location.search);

  if (lang && municipalityName) {
    store.dispatch(changeLanguage(lang));
    store.dispatch(getMunicipalityData(lang, municipalityName));
  }
};

const redirectToStartMunicipality = (match, path) => {
  const { lang, municipalityName } = match.params;
  ReactGA.pageview(window.location.pathname + window.location.search);
  const municipality = municipalityName || localStorage.getItem('callbackMunicipality');
  const language = lang || localStorage.getItem('callbackLanguage');
  const pathname = path || 'start';

  return <Redirect to={`${PATH_PREFIX}/${language}/${municipality}/${pathname}`} />;
};

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const hasLoginState = store.getState().SessionReducer.userAuth === true;

  if (hasLoginState) {
    return (
      <Route
        {...rest}
        render={props => ((<Component {...props} />)
      )}
      />
    );
  }
  return <SessionHandlerComponent {...rest} />;
};

export default () => (
  <Switch>
    <Route
      exact
      path={`${PATH_PREFIX}/`}
      component={({ match }) => redirectToStartMunicipality(match)}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/admin`}
      component={MunicipalityListComponent}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/admin/${URL_TYPES.MUNICIPALITY}/:municipalityName`}
      component={({ match }) => <MunicipalityComponent match={match} />}
    />

    <Route
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/`}
      component={({ match }) => redirectToStartMunicipality(match)}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/${URL_TYPES.LOGIN}`}
      component={({ match }) => {
        initApp(match);
        const localLang = localStorage.getItem('callbackLanguage');
        const localMunicipality = localStorage.getItem('callbackMunicipality');
        const matchWithLocation = {
          ...match,
          location: {
            pathname: `${PATH_PREFIX}/${localLang}/${localMunicipality}/start`,
          },
        };

        return <SessionHandlerComponent match={matchWithLocation} />;
      }
    }
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.LOGOUT}`}
      component={({ match }) => <SessionHandlerComponent match={match} />}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.SETTINGS}`}
      component={({ match }) => {
      initApp(match);
      store.dispatch(setNavBarOption(URL_TYPES.SETTINGS));
      store.dispatch(getAboutMunicipality(match.params.municipalityName));
      return <SettingsComponent match={match} />;
    }}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.ABOUT_MUNICIPALITY}`}
      component={({ match }) => {
      initApp(match);
      store.dispatch(setNavBarOption(URL_TYPES.ABOUT_MUNICIPALITY));
      store.dispatch(getAboutMunicipality(match.params.municipalityName));
      return <AboutMunicipalityComponent match={match} />;
    }}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.START}`}
      component={({ match }) => {
      initApp(match);
      store.dispatch(setNavBarOption(URL_TYPES.START));
      return <StartPageComponent match={match} />;
    }}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.CONTACT}`}
      component={({ match }) => {
      initApp(match);
      store.dispatch(setNavBarOption(URL_TYPES.CONTACT));
      return <ContactComponent match={match} />;
    }}
    />;

  <ProtectedRoute
    exact
    path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.MEDIA}`}
    component={({ match }) => {
      initApp(match);
      store.dispatch(setNavBarOption(URL_TYPES.MEDIA));
      return <MediaLibaryComponent match={match} />;
    }}
  />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.MEDIA}/upload`}
      component={({ match }) => {
      initApp(match);
      store.dispatch(setNavBarOption(URL_TYPES.MEDIA));
      return <ImageUploadComponent match={match} />;
    }}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.MAP_STATE}`}
      component={({ match }) => {
      initApp(match);
      store.dispatch(getAreasByMunicipalityName(match.params.municipalityName));
      store.dispatch(setNavBarOption(URL_TYPES.MAP_STATE));
      return <MapStateComponent match={match} />;
    }}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.AREAS}`}
      component={({ match }) => {
      initApp(match);
      store.dispatch(getAreasByMunicipalityName(match.params.municipalityName));
      store.dispatch(setNavBarOption(URL_TYPES.AREAS));
      return <AreasComponent match={match} />;
    }}
    />

    <ProtectedRoute
      exact
      path={`${PATH_PREFIX}/:lang(sv|en)/:municipalityName/${URL_TYPES.AREA}/:areaId`}
      component={({ match }) => {
      initApp(match);
      if (match.params.areaId !== 'new') {
        store.dispatch(getAreaOverview(match.params.areaId));
      } else {
        store.dispatch(receiveAreaOverviewData(''));
      }
      store.dispatch(getAreasByMunicipalityName(match.params.municipalityName));
      store.dispatch(setNavBarOption(URL_TYPES.AREAS));
      return <AreaDetailsComponent match={match} />;
    }}
    />

    <Route
      exact
      path={`${PATH_PREFIX}/404`}
      component={({ match }) => <PageNotFoundComponent match={match} />}
    />

    <Redirect to={`${PATH_PREFIX}/404`} />

  </Switch>
);
