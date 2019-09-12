import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { push } from 'react-router-redux';
import classNames from 'classnames';
import { getAllMunicipality } from '../../Utils/fetcherUtil';
import { URL_TYPES, PATH_PREFIX } from '../../Constants';
import LoadingIndicatorComponent from './../LoadingIndicatorComponent';
import { setLoadingIndicator } from '../../Actions/ToggleActions';


const municipalityUrl = (language, name) => `${PATH_PREFIX}/${language}/${URL_TYPES.ADMIN}/${URL_TYPES.MUNICIPALITY}/${name}`;

class MunicipalityListComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { municipalities: [] };
  }

  componentDidMount() {
    const {
      dispatch,
      signInUserSession: { idToken: { jwtToken } },
    } = this.props;

    dispatch(setLoadingIndicator(true));
    getAllMunicipality(jwtToken).then((result) => {
      this.setState({ municipalities: result.data });
      dispatch(setLoadingIndicator(false));
    }).catch((error) => {
      console.log(error);
      dispatch(setLoadingIndicator(false));
    });
  }

  getList() {
    const { municipalities } = this.state;
    const {
      languageReducer: {
        language,
      },
    } = this.props;
    return (
      <ul>
        {municipalities
          .sort((m1, m2) => m1.name.toLowerCase().localeCompare(m2.name.toLowerCase(), 'sv'))
          .map(municipality => (
            <li
              key={municipality.municipalityId}
              className={classNames({ enabled: municipality.enabled })}
            >
              <NavLink to={municipalityUrl(language, municipality.name)}>
                {municipality.name}
              </NavLink>
            </li>
        ))}
      </ul>
    );
  }

  render() {
    const {
      loading,
      languageReducer: {
        language,
        applicationText: {
          admin,
        },
      },
      dispatch,
    } = this.props;

    return (
      <div className="content-wrapper municipality-list-wrapper">
        {loading ? (
          <LoadingIndicatorComponent />
        ) : (
          this.getList()
      )}
        <input
          type="button"
          className="btn green"
          value={admin.addMunicipality}
          onClick={() =>
            dispatch(push(`${PATH_PREFIX}/${language}/${URL_TYPES.ADMIN}/${URL_TYPES.MUNICIPALITY}/${URL_TYPES.NEW}`))}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  languageReducer: state.LanguageReducer,
  loading: state.ToggleReducer.loading,
  signInUserSession: state.SessionReducer.authObject.signInUserSession,
});

export default connect(mapStateToProps)(MunicipalityListComponent);
