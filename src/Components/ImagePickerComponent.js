import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import classNames from 'classnames';
import { BUCKET_URL } from '../Constants';
import { getImagesFromMuniFolder } from '../Utils/awsUtil';
import { deleteImage } from '../Utils/fetcherUtil';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';

class ImagePickerComponent extends Component {
  constructor() {
    super();

    this.state = {
      availableImages: undefined,
      showPickerModal: false,
      imageModal: {
        visible: false,
        url: undefined,
        name: undefined,
      },
      removePopup: {
        visible: false,
        key: undefined,
        name: undefined,
      },
    };
  }

  componentDidMount() {
    this.setAvailableImages();
  }

  setAvailableImages() {
    getImagesFromMuniFolder(this.props.municipalityReducer.name).then(data =>
      this.setState({ availableImages: data.Contents }));
  }

  removeFromBucketPopup(key) {
    const {
      sessionReducer: {
        authObject: {
          signInUserSession: { idToken: { jwtToken } },
        },
      },
      languageReducer: {
        applicationText: {
          general: {
            saveSuccess,
            saveError,
          },
        },
      },
    } = this.props;

    deleteImage(key, jwtToken).then(() => {
      this.setState({
        availableImages: [],
        removePopup: {
          visible: false,
          key: undefined,
          name: undefined,
        },
      });
      toast.success(saveSuccess);
      getImagesFromMuniFolder(this.props.municipalityReducer.name).then(data =>
        this.setState({ availableImages: data.Contents }));
    }).catch((error) => {
      toast.error(saveError);
      console.error(error);
    });
  }

  renderImagesFromBucket() {
    const { availableImages } = this.state;
    const { selectImageEvent, type } = this.props;

    return (
      availableImages ?
        <div className="selected-images-wrapper row collapse">
          {availableImages
            .sort((a, b) => a.metaData.filename.localeCompare(b.metaData.filename)).map(i => (
        i.Size > 0 &&
        <div key={i.Key} className="image-wrapper">
          <p>{i.metaData ? decodeURI(i.metaData.filename) : '-'}</p>
          {type === 'mediaLibrary' &&
            <div className="close-container">
              <button
                onClick={() =>
                this.setState({
                  removePopup: {
                    visible: true,
                    key: i.Key,
                    name: decodeURI(i.metaData.filename),
                  },
                })}
                className="btn close-circle"
              />
            </div>
          }
          <button
            className={classNames('image', { 'magnifying-glass': type === 'mediaLibrary' })}
            style={{ backgroundImage: `url(${BUCKET_URL + i.Key})` }}
            onClick={() => {
              if (type === 'mediaLibrary') {
                this.setState({
                  imageModal: {
                   visible: true,
                   url: BUCKET_URL + i.Key,
                   name: decodeURI(i.metaData.filename),
                 },
               });
              } else {
                selectImageEvent(BUCKET_URL + i.Key);
                this.setState({ showPickerModal: false });
              }
            }}
          />
        </div>
      ))}
        </div>
        :
        <LoadingIndicatorComponent />
    );
  }

  renderSelectedImages() {
    const {
      imageArray,
      removeImageEvent,
      languageReducer: { applicationText: { general: { section: { add }, image } } },
    } = this.props;

    return (
      <div className="selected-images-wrapper row collapse">
        {imageArray.sort((a, b) => a.index - b.index).map(i => (
          <div key={i.index} className="image-wrapper">
            <div className="close-container">
              <button onClick={() => removeImageEvent(i.index)} className="btn close-circle" />
            </div>
            <p>{`${image} ${i.index}`}</p>
            <div className="background-shadow">
              <div className="image" style={{ backgroundImage: `url(${i.url})` }} />
            </div>
          </div>))}
        <div className="image-wrapper">
          <button className="image add" onClick={() => this.setState({ showPickerModal: true })}>
            <div className="wrapper">
              <div className="plus-sign" />
              <p>{`${add} ${image}`}</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  renderSelectedImage() {
    const {
      imageUrl,
      label,
      languageReducer: { applicationText: { imagePicker: { chooseAImage } } },
    } = this.props;

    return (
      <div className="selected-images-wrapper row collapse">
        <div className="image-wrapper single">
          <p className="single">{label}</p>
          <div className="background-shadow">
            <div className="image" style={{ backgroundImage: `url(${imageUrl})` }} />
          </div>
        </div>
        <div className="add-link-wrapper">
          <button
            className="blue-link add-icon underline"
            onClick={() => this.setState({ showPickerModal: true })}
          >
            {chooseAImage}
          </button>
        </div>
      </div>
    );
  }

  renderRemovePopup() {
    const {
      removePopup: { key, name },
    } = this.state;

    const {
      languageReducer: {
        applicationText: {
          imagePicker: { removeAreYouSurePt1, removeAreYouSurePt2 },
          general: { section: { remove }, cancel },
        },
      },
    } = this.props;

    return (
      <div className="image-picker-modal">
        <div className="inner-container popup">
          <p>{removeAreYouSurePt1}<strong>{name}</strong>{removeAreYouSurePt2}</p>
          <button
            className="btn red"
            onClick={() => this.removeFromBucketPopup(key)}
          >
            {remove}
          </button>
          <button
            className="blue-link underline f16 ml15"
            onClick={() => this.setState({ removePopup: { visible: false } })}
          >
            {cancel}
          </button>
        </div>
      </div>
    );
  }

  renderImageModal() {
    const {
      imageModal: { url, name },
    } = this.state;

    return (
      <div className="image-picker-modal">
        <div
          className="inner-container image-modal"
          style={{ backgroundImage: `url(${url})` }}
        >
          <div className="close-container">
            <button
              onClick={() => this.setState({
              imageModal: {
               visible: false,
               url: undefined,
               name: undefined,
             },
           })}
              className="btn close-circle"
            />
          </div>
          <h2>{name}</h2>
        </div>
      </div>
    );
  }

  renderImagePickerModal() {
    const {
      languageReducer: { applicationText: { imagePicker: { chooseAImage } } },
    } = this.props;

    return (
      <div className="image-picker-modal">
        <div className="inner-container">
          <div className="images">
            <div className="close-container">
              <button
                onClick={() => this.setState({ showPickerModal: false })}
                className="btn close-circle"
              />
            </div>
            <h2>{chooseAImage}</h2>
            {this.renderImagesFromBucket()}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      type,
    } = this.props;

    const {
      showPickerModal,
      removePopup,
      imageModal,
    } = this.state;

    return (
      type === 'mediaLibrary' ?
        <div>
          {this.renderImagesFromBucket()}
          {
            removePopup.visible &&
            this.renderRemovePopup()
          }
          {
            imageModal.visible &&
            this.renderImageModal()
          }
          <ToastContainer />
        </div>
        :
        <div className="image-picker-wrapper">
          {showPickerModal &&
            this.renderImagePickerModal()
          }
          {type === 'single' ? this.renderSelectedImage() : this.renderSelectedImages() }
        </div>
    );
  }
}

const mapStateToProps = state => ({
  sessionReducer: state.SessionReducer,
  languageReducer: state.LanguageReducer,
  municipalityReducer: state.MunicipalityReducer,
});

export default connect(mapStateToProps)(ImagePickerComponent);
