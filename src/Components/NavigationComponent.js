import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { push } from 'react-router-redux';
import classNames from 'classnames';
import { URL_TYPES, PATH_PREFIX, FRONTEND_URL } from '../Constants';

class NavigationComponent extends Component {
  changeLanguage() {
    const {
      dispatch,
      router: { location: { pathname } },
      languageReducer: { language },
    } = this.props;

    dispatch(push(language === 'en' ? pathname.replace('/en/', '/sv/') : pathname.replace('/sv/', '/en/')));
  }

  render() {
    const {
      languageReducer: {
        language,
        applicationText: {
          navigationSideBar: {
            loggedInAs, municipalityOverview, areas, logOut, media, mapState,
            contact, settings, inactivatedDesc, activateContact,
          },
          startPage: { preview },
        },
      },
      municipalityReducer: { name, enabled },
      sessionReducer: { userAuth, authObject },
      toggleReducer: { selectedNavBarOption },
    } = this.props;

    return (
      <div>
        {(userAuth && name && language) &&
        <div className="navigation-side-bar-wrapper">
          <div className="inner">
            <div className="logged-in-box">
              {
                authObject ?
                  <div>
                    <p>{loggedInAs}</p>
                    <p>{authObject.username}</p>
                  </div>
                : null
              }
            </div>
            <NavLink
              className={classNames('menu-item', { selected: selectedNavBarOption === URL_TYPES.START })}
              to={`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.START}`}
            >
          Start
            </NavLink>
            <NavLink
              className={classNames('menu-item', { selected: selectedNavBarOption === URL_TYPES.CONTACT })}
              to={`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.CONTACT}`}
            >
              {contact}
            </NavLink>
            <NavLink
              className={classNames('menu-item', { selected: selectedNavBarOption === URL_TYPES.MAP_STATE })}
              to={`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.MAP_STATE}`}
            >
              {mapState}
            </NavLink>
            <NavLink
              className={classNames('menu-item', { selected: selectedNavBarOption === URL_TYPES.ABOUT_MUNICIPALITY })}
              to={`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.ABOUT_MUNICIPALITY}`}
            >
              {municipalityOverview}
            </NavLink>
            <NavLink
              className={classNames('menu-item', { selected: selectedNavBarOption === URL_TYPES.AREAS })}
              to={`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.AREAS}`}
            >
              {areas}
            </NavLink>
            <NavLink
              className={classNames('menu-item', { selected: selectedNavBarOption === URL_TYPES.MEDIA })}
              to={`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.MEDIA}`}
            >
              {media}
            </NavLink>
            <NavLink
              className={classNames('menu-item', { selected: selectedNavBarOption === URL_TYPES.SETTINGS })}
              to={`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.SETTINGS}`}
            >
              {settings}
            </NavLink>
            <NavLink
              className="menu-item border-bottom"
              to={`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.LOGOUT}`}
            >
              {logOut}
            </NavLink>
            {!enabled &&
              <div className="inactivated-description">
                <span className="warning-icon" />
                <p>{inactivatedDesc}</p>
                <p className="contact">{activateContact}</p>
                <NavLink
                  className="btn green"
                  target="_blank"
                  to={`${FRONTEND_URL}/${language}/${name}/${URL_TYPES.START}?preview=true`}
                >
                  {preview}
                </NavLink>
              </div>
            }
          </div>
          <button
            className={classNames('btn language-toggle', { english: language === 'sv', swedish: language === 'en' })}
            onClick={() => this.changeLanguage()}
          />
        </div>}
      </div>
    );
  }
}
const mapStateToProps = state => ({
  toggleReducer: state.ToggleReducer,
  languageReducer: state.LanguageReducer,
  municipalityReducer: state.MunicipalityReducer,
  sessionReducer: state.SessionReducer,
  router: state.router,
});
export default connect(mapStateToProps)(NavigationComponent);
