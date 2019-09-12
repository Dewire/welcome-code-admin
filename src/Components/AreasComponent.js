import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { ToastContainer, toast } from 'react-toastify';
import { setShowSuccessToast } from '../Actions/ToggleActions';
import { URL_TYPES } from '../Constants';
import AreaListComponent from './AreaListComponent';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';

class AreasComponent extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.toggleReducer && nextProps.toggleReducer.showSuccessToast
      && !nextProps.toggleReducer.loading) {
      this.showSuccessToast();
    }
  }

  showSuccessToast() {
    const {
      dispatch,
      languageReducer: {
        applicationText: {
          general: {
            saveSuccess,
          },
        },
      },
    } = this.props;

    toast.success(saveSuccess);
    dispatch(setShowSuccessToast(false));
  }

  render() {
    const {
      languageReducer: {
        language,
        applicationText: {
          areas: {
            title,
            add,
          },
        },
      },
      municipalityReducer: { name },
      toggleReducer: { loading },
      dispatch,
    } = this.props;

    return (
      !loading ?
        <div className="content-wrapper">
          <ToastContainer />
          <div className="areas-wrapper">
            <h2>{title}</h2>
            <button
              className="btn green"
              onClick={
            () => {
                dispatch(push(`/${language}/${name}/${URL_TYPES.AREA}/new`));
            }
          }
            >{add}
            </button>
            <AreaListComponent
              areaOnClick={(a) => {
                dispatch(push(`/${language}/${name}/${URL_TYPES.AREA}/${a.areaId}`));
            }}
            />
          </div>
        </div>
        :
        <LoadingIndicatorComponent />
    );
  }
}
const mapStateToProps = state => ({
  areaReducer: state.AreaReducer,
  municipalityReducer: state.MunicipalityReducer,
  languageReducer: state.LanguageReducer,
  sessionReducer: state.SessionReducer,
  toggleReducer: state.ToggleReducer,
});
export default connect(mapStateToProps)(AreasComponent);
