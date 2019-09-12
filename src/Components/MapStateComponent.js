/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { Prompt } from 'react-router-dom';
import { setLoadingIndicator } from '../Actions/ToggleActions';
import MapViewComponent from './MapViewComponent';
import InputWithLabel from './InputWithLabel';
import { putMunicipality } from '../Utils/fetcherUtil';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import { validateLength } from '../Utils/otherUtils';

class MapStateComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialMapState: undefined,
      isDirty: false,
      hasError: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.municipalityReducer !==
      this.props.municipalityReducer) {
      this.setState({
        initialMapState: nextProps.municipalityReducer.initialMapState,
      });
    }
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

  submitMapState() {
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

    const { initialMapState, hasError, isDirty } = this.state;

    if (!hasError.length && isDirty) {
      dispatch(setLoadingIndicator(true));
      putMunicipality(municipalityReducer.name, { initialMapState }, jwtToken).then(() => {
        dispatch(setLoadingIndicator(false));
        this.setState({
          isDirty: false,
        });
        toast.success(saveSuccess);
      }).catch((error) => {
        dispatch(setLoadingIndicator(false));
        toast.error(saveError);
        console.log(error);
      });
    }
  }

  toggleError(id, fieldHasError) {
    const { hasError } = this.state;

    if (fieldHasError && hasError.indexOf(id) === -1) {
      hasError.push(id);
      this.setState({ hasError });
    } else if (!fieldHasError && hasError.indexOf(id) > -1) {
      hasError.splice(hasError.indexOf(id), 1);
      this.setState({ hasError });
    }
  }

  renderMapStateInputs() {
    const {
      areaReducer: { areas },
      languageReducer: {
        applicationText: {
          general: { name },
          mapState: {
            mapPlacement, mapPlacementDesc, commuteDestination,
          },
          inputWithLabel,
        },
      },
    } = this.props;
    const { initialMapState } = this.state;

    return (
      (initialMapState && areas) &&
      <div>
        <h3>{mapPlacement}</h3>
        <p className="description">{mapPlacementDesc}</p>
        <MapViewComponent
          MapViewReducer={{ ...initialMapState }}
          mapStateComponent
          onMapStateChange={(coordinates, zoom) =>
            this.setState({
                isDirty: true,
                initialMapState: {
                  ...initialMapState,
                  center: {
                    lat: coordinates.lat,
                    long: coordinates.lng,
                  },
                  zoom,
                },
               })
          }
          onAreaCoordinatesChange={coordinates =>
          this.setState({
              isDirty: true,
              initialMapState: {
                ...initialMapState,
                commuteDestination: {
                  ...initialMapState.commuteDestination,
                  lat: coordinates.lat,
                  long: coordinates.lng,
                },
              },
             })
           }
        />
        <h3>{commuteDestination}</h3>
        <InputWithLabel
          id="name"
          type="text"
          value={initialMapState.commuteDestination.name}
          label={name}
          toggleError={(id, hasErr) => this.toggleError(id, hasErr)}
          onChange={e =>
            this.setState({
                isDirty: true,
                initialMapState: {
                    ...initialMapState,
                    commuteDestination: {
                      ...initialMapState.commuteDestination,
                      name: e.target.value,
                    },
                  },
               })
          }
          validate={[validateLength(inputWithLabel)]}
        />
      </div>
    );
  }

  render() {
    const {
      toggleReducer: { loading },
      languageReducer: {
        applicationText: {
          general: {
            save, unsavedAlert,
          },
          mapState: { heading },
        },
      },
    } = this.props;

    const {
      hasError,
      isDirty,
    } = this.state;

    return (
      !loading ?
        <div>
          <Prompt
            when={isDirty}
            message={unsavedAlert}
          />
          <div className="content-wrapper area-details-wrapper">
            <h2>{heading}</h2>
            {this.renderMapStateInputs()}
          </div>
          <div className="bottom-container">
            <button
              disabled={!isDirty || hasError.length > 0}
              className="btn green"
              onClick={() => this.submitMapState()}
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
  languageReducer: state.LanguageReducer,
  sessionReducer: state.SessionReducer,
  municipalityReducer: state.MunicipalityReducer,
  areaReducer: state.AreaReducer,
  toggleReducer: state.ToggleReducer,
});
export default connect(mapStateToProps)(MapStateComponent);
