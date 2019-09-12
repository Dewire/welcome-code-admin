/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { URL_TYPES, PATH_PREFIX } from '../Constants';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import ImagePickerComponent from './ImagePickerComponent';

class MediaLibaryComponent extends Component {
  render() {
    const {
      dispatch,
      toggleReducer: { loading },
      municipalityReducer: { name },
      languageReducer: {
        language,
        applicationText: {
          media: {
            heading,
          },
          imageUpload: {
            heading: uploadImage,
          },
        },
      },
    } = this.props;

    return (
      !loading ?
        <div>
          <div className="media-library-view-wrapper" >
            <h2>{heading}</h2>
            <button
              className="btn green"
              onClick={
            () => {
                dispatch(push(`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.MEDIA}/upload`));
            }
          }
            >{uploadImage}
            </button>
            <ImagePickerComponent type="mediaLibrary" />
          </div>
        </div>
        :
        <LoadingIndicatorComponent />
    );
  }
}

const mapStateToProps = state => ({
  municipalityReducer: state.MunicipalityReducer,
  sessionReducer: state.SessionReducer,
  languageReducer: state.LanguageReducer,
  toggleReducer: state.ToggleReducer,
});
export default connect(mapStateToProps)(MediaLibaryComponent);
