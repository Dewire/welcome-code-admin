import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { ToastContainer, toast } from 'react-toastify';
import {
  getMunicipality,
  createMunicipality,
  enableDisableMunicipality,
  updateMapCredentials,
} from '../../Utils/fetcherUtil';
import {
  URL_TYPES,
  PATH_PREFIX,
} from '../../Constants';
import InputWithLabel from '../InputWithLabel';
import LoadingIndicatorComponent from './../LoadingIndicatorComponent';
import ManageUsersComponent from './ManageUsersComponent';
import { setLoadingIndicator } from '../../Actions/ToggleActions';

class MunicipalityComponent extends Component {
  constructor(props) {
    super(props);
    const { match: { params: { municipalityName } } } = this.props;
    // check if url contains /new (means we should create and not update)
    const isNew = municipalityName === 'new';
    this.state = {
      municipality: {},
      name: '',
      enabled: false,
      username: '',
      password: '',
      isNew,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { municipalityName },
      },
      signInUserSession: {
        idToken: { jwtToken },
      },
    } = this.props;

    if (municipalityName !== 'new') {
      this.setLoading(true);
      getMunicipality(municipalityName, jwtToken).then((result) => {
        const {
          data,
          data: {
            name, enabled,
            mapCredentials: {
              username = '',
              password = '',
            } = {},
          },
        } = result;

        this.setState({
          municipality: data,
          name,
          enabled,
          username,
          password,
        });

        this.setLoading(false);
      }).catch((error) => {
        console.log(error);
        this.toast(false);
        this.setLoading(false);
      });
    }
  }

  setLoading(isLoading) {
    const { dispatch } = this.props;
    dispatch(setLoadingIndicator(isLoading));
  }

  handleInputChange(event) {
    const {
      target: {
        type, value, checked, name,
      },
    } = event;
    const targetValue = type === 'checkbox' ? checked : value;

    this.setState({
      [name]: targetValue,
    });
  }

  saveMunicipality() {
    const { isNew } = this.state;
    const {
      signInUserSession: {
        idToken: { jwtToken },
      },
    } = this.props;

    if (isNew) {
      this.createMunicipality(jwtToken);
    } else {
      this.updateMunicipality(jwtToken);
    }
  }

  async createMunicipality(jwtToken) {
    const { name } = this.state;

    const {
      dispatch,
      languageReducer: { language },
    } = this.props;

    try {
      this.setLoading(true);
      await createMunicipality(name, jwtToken);
      dispatch(push(`${PATH_PREFIX}/${language}/${URL_TYPES.ADMIN}/${URL_TYPES.MUNICIPALITY}/${name}`));
    } catch (e) {
      this.setLoading(false);
      this.toast(false);
      console.log('Error creating new municipality', e);
    }
  }

  async updateMunicipality(jwtToken) {
    const {
      enabled,
      username,
      password,
      municipality: {
        name,
        enabled: origEnabled,
        mapCredentials: {
          username: origUsername = '',
          password: origPassword = '',
        } = {},
      },
    } = this.state;

    this.setLoading(true);
    try {
      let reqComplete;
      if (enabled !== origEnabled) {
        reqComplete = await enableDisableMunicipality(name, enabled, jwtToken);
      }
      if (username !== origUsername || password !== origPassword) {
        const mapCredentials = {
          username,
          password,
        };
        reqComplete = await updateMapCredentials(name, mapCredentials, jwtToken);
      }
      if (reqComplete) this.toast(true);
    } catch (e) {
      this.toast(false);
    } finally {
      this.setLoading(false);
    }
  }

  toast(isSuccess) {
    const {
      languageReducer: {
        applicationText: {
          general: { saveSuccess, saveError },
        },
      },
    } = this.props;

    if (isSuccess) toast.success(saveSuccess);
    else toast.error(saveError);
  }

  render() {
    const {
      name,
      enabled,
      username,
      password,
      isNew,
    } = this.state;
    const {
      languageReducer: {
        applicationText: { general, admin },
      },
      signInUserSession: {
        idToken: { jwtToken },
      },
      loading,
    } = this.props;

    return (
      <div className="content-wrapper">
        <h2>{admin.municipality}</h2>
        {loading &&
          <LoadingIndicatorComponent />
        }
        {isNew ? (
          <InputWithLabel
            id="name"
            type="text"
            label={general.name}
            value={name}
            disabled={!isNew}
            onChange={e => this.handleInputChange(e)}
          />
      ) : (
        <div>
          <InputWithLabel
            id="name"
            type="text"
            label={general.name}
            value={name}
            disabled={!isNew}
            onChange={e => this.handleInputChange(e)}
          />
          <InputWithLabel
            id="enabled"
            type="checkbox"
            label={admin.enabled}
            checked={enabled}
            onChange={e => this.handleInputChange(e)}
          />
          <p>{admin.lantmateriet}</p>
          <InputWithLabel
            id="username"
            type="password"
            label={admin.username}
            value={username}
            onChange={e => this.handleInputChange(e)}
          />
          <InputWithLabel
            id="password"
            type="password"
            label={admin.password}
            value={password}
            onChange={e => this.handleInputChange(e)}
          />
        </div>
      )}
        <div>
          <input
            type="button"
            className="btn green"
            value={general.save}
            onClick={() => this.saveMunicipality()}
          />
        </div>
        { !isNew && name.length > 0 &&
          <div className="manage-users-wrapper">
            <ManageUsersComponent
              municipality={name}
              jwtToken={jwtToken}
              text={admin}
              isLoading={isLoading => this.setLoading(isLoading)}
              toast={isSuccess => this.toast(isSuccess)}
            />
          </div>
        }
        <ToastContainer />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  languageReducer: state.LanguageReducer,
  signInUserSession: state.SessionReducer.authObject.signInUserSession,
  loading: state.ToggleReducer.loading,
});

export default connect(mapStateToProps)(MunicipalityComponent);
