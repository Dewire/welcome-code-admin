/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import { setLoadingIndicator } from '../Actions/ToggleActions';
import { putMunicipality } from '../Utils/fetcherUtil';
import blueThemePlaceholder from '../Images/Placeholders/theme_blue.png';
import greenThemePlaceholder from '../Images/Placeholders/theme_green.png';
import orangeThemePlaceholder from '../Images/Placeholders/theme_orange.png';

class SettingsComponent extends Component {
  constructor() {
    super();
    this.state = {
      theme: undefined,
      isDirty: false,
    };
  }

  componentDidMount() {
    window.addEventListener('beforeunload', e => this.onWindowUnload(e));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.municipalityReducer && nextProps.municipalityReducer.theme) {
      this.setState({
        theme: nextProps.municipalityReducer.theme,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', e => this.onWindowUnload(e));
  }

  onWindowUnload(e) {
    const { isDirty } = this.state;
    const {
      languageReducer: {
        applicationText: {
          general: { unsavedAlert },
        },
      },
    } = this.props;

    if (isDirty) {
      (e || window.event).returnValue = { unsavedAlert };
      return { unsavedAlert };
    }
    return null;
  }

  submitSettings() {
    const {
      dispatch,
      sessionReducer: {
        authObject: {
          signInUserSession: { idToken: { jwtToken } },
        },
      },
      municipalityReducer,
      languageReducer: {
        applicationText: {
          general: {
            saveSuccess, saveError,
          },
        },
      },
    } = this.props;

    const { theme, isDirty } = this.state;
    const municipalityObj = { ...municipalityReducer, theme };

    delete municipalityObj.createdAt;

    if (isDirty) {
      dispatch(setLoadingIndicator(true));
      putMunicipality(municipalityObj.name, municipalityObj, jwtToken).then(() => {
        dispatch(setLoadingIndicator(false));
        this.setState({
          isDirty: false,
          theme,
        });
        toast.success(saveSuccess);
      }).catch((error) => {
        dispatch(setLoadingIndicator(false));
        toast.error(saveError);
        console.error(error);
      });
    }
  }


  handleChangeTheme(e) {
    this.setState({
      theme: e.target.value,
      isDirty: true,
    });
  }

  render() {
    const {
      toggleReducer: { loading },
      languageReducer: {
        applicationText: {
          general: {
            save, unsavedAlert,
          },
          theme: themeText,
        },
      },
    } = this.props;

    const {
      theme,
      isDirty,
    } = this.state;

    return (
      (!loading && theme) ?
        <div>
          <div className="content-wrapper start-page-wrapper">
            <Prompt
              when={isDirty}
              message={unsavedAlert}
            />
            <h2>{themeText.header}</h2>
            <div className="theme-wrapper">
              <label htmlFor="theme_green">
                <input
                  id="theme_green"
                  type="radio"
                  value="green"
                  checked={theme === 'green'}
                  onChange={e => this.handleChangeTheme(e)}
                />
                {themeText.green}
              </label>
              <img src={greenThemePlaceholder} alt={themeText.green} />
              <label htmlFor="theme_orange">
                <input
                  id="theme_orange"
                  type="radio"
                  value="orange"
                  checked={theme === 'orange'}
                  onChange={e => this.handleChangeTheme(e)}
                />
                {themeText.orange}
              </label>
              <img src={orangeThemePlaceholder} alt={themeText.orange} />
              <label htmlFor="theme_blue">
                <input
                  id="theme_blue"
                  type="radio"
                  value="blue"
                  checked={theme === 'blue'}
                  onChange={e => this.handleChangeTheme(e)}
                />
                {themeText.blue}
              </label>
              <img src={blueThemePlaceholder} alt={themeText.blue} />
            </div>
          </div>
          <div className="bottom-container">
            <button
              disabled={!isDirty}
              className="btn green"
              onClick={() => this.submitSettings()}
            >{save}
            </button>
            <ToastContainer />
          </div>
        </div>
        :
        <LoadingIndicatorComponent />
    );
  }
}

const mapStateToProps = state => ({
  municipalityReducer: state.MunicipalityReducer,
  languageReducer: state.LanguageReducer,
  sessionReducer: state.SessionReducer,
  toggleReducer: state.ToggleReducer,
});

export default connect(mapStateToProps)(SettingsComponent);
