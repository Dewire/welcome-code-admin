/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Files from 'react-files';
import ReactCrop from 'react-image-crop';
import ImageCompressor from 'image-compressor.js';
import 'react-image-crop/lib/ReactCrop.scss';
import { ToastContainer, toast } from 'react-toastify';
import { setLoadingIndicator } from '../Actions/ToggleActions';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import cutIcon from '../Images/Icons/icon_cut.svg';
import { URL_TYPES, PATH_PREFIX } from '../Constants';
import { putImage } from '../Utils/fetcherUtil';

const IMG_SIZE_LIMIT = 300000; // Bytes
const IMG_MAX_WIDTH = 1440;
const IMG_MAX_HEIGHT = 900;
const DEFAULT_CROP = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};

class ImageUploadComponent extends Component {
  static compressImg(image, quality) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-new
      new ImageCompressor(image, {
        quality,
        maxWidth: IMG_MAX_WIDTH,
        maxHeight: IMG_MAX_HEIGHT,
        success(result) {
          resolve(result);
        },
        error(e) {
          reject(e.message);
        },
      });
    });
  }

  static blobToDataURL(blob, callback) {
    const a = new FileReader();
    a.onload = (e) => { callback(e.target.result); };
    a.readAsDataURL(blob);
  }

  constructor(props) {
    super(props);
    this.state = {
      image: undefined,
      crop: DEFAULT_CROP,
      imageWidth: undefined,
      imageHeight: undefined,
      croppedFile: undefined,
      fileError: false,
      errorMsg: undefined,
      imgType: undefined,
    };
  }

  onCropChange(crop) {
    const setCrop = !crop.width && !crop.height ? DEFAULT_CROP : crop;
    this.setState({ crop: setCrop });
  }

  onFilesChange(inputFiles) {
    const currentFile = inputFiles[inputFiles.length - 1];

    if (inputFiles.length !== 0) {
      const img = document.createElement('img');
      const blob = URL.createObjectURL(inputFiles[inputFiles.length - 1]);
      img.src = blob;
      img.onload = () => {
        this.setState({
          imageWidth: img.width,
          imageHeight: img.height,
          crop: DEFAULT_CROP,
          croppedFile: undefined,
          imgType: currentFile.type,
        });

        this.cropAndCompress(img.src, DEFAULT_CROP);
      };

      this.setState({
        image: inputFiles[inputFiles.length - 1],
      });

      if (currentFile.type === 'image/jpg' || currentFile.type === 'image/jpeg' || currentFile.type === 'image/png') {
        this.setState({
          fileError: false,
        });
      } else {
        this.setState({
          fileError: true,
        });
      }
    }
  }

  onFilesError(error) {
    const {
      languageReducer: {
        applicationText: {
          imageUpload: { errorMsgWrongFormat, errorMsgTooLarge, errorMsgOther },
        },
      },
    } = this.props;

    switch (error.code) {
      case 1:
        this.setState({ errorMsg: errorMsgWrongFormat });
        break;
      case 2:
        this.setState({ errorMsg: errorMsgTooLarge });
        break;
      default:
        this.setState({ errorMsg: errorMsgOther });
    }

    this.setState({
      fileError: true,
      croppedFile: undefined,
      image: undefined,
    });
    console.log(`error code ${error.code}: ${error.message}`);
  }

  getCroppedImg(image, pixelCrop) {
    const myImage = new Image();
    myImage.src = image;

    const pixelsw = this.state.imageWidth * (pixelCrop.width / 100);
    const pixelsh = this.state.imageHeight * (pixelCrop.height / 100);

    const pixelsx = this.state.imageWidth * (pixelCrop.x / 100);
    const pixelsy = this.state.imageHeight * (pixelCrop.y / 100);

    const canvas = document.createElement('canvas');
    canvas.width = pixelsw;
    canvas.height = pixelsh;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      myImage,
      pixelsx,
      pixelsy,
      pixelsw,
      pixelsh,
      0,
      0,
      pixelsw,
      pixelsh,
    );

    return new Promise((resolve) => {
      canvas.toBlob((file) => {
        resolve(file);
      }, this.state.imgType);
    });
  }

  async cropAndCompress(image, pixelCrop) {
    let compressedImg = await this.getCroppedImg(image, pixelCrop);

    for (let i = 9; i > 0; i -= 1) {
      if (compressedImg.size < IMG_SIZE_LIMIT) {
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      compressedImg = await ImageUploadComponent.compressImg(compressedImg, i / 10);
    }

    ImageUploadComponent.blobToDataURL(compressedImg, url =>
      this.setState({ croppedFile: url }));
  }

  submitImg() {
    const {
      dispatch,
      sessionReducer: {
        authObject: {
          signInUserSession: { idToken: { jwtToken } },
        },
      },
      municipalityReducer: { name },
      languageReducer: {
        applicationText: {
          general: {
            saveError,
            saveSuccess,
          },
        },
      },
    } = this.props;

    const { image, croppedFile } = this.state;

    const data = {
      filename: encodeURI(image.name),
      contentType: image.type,
      body: croppedFile.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
      isBase64: true,
    };

    dispatch(setLoadingIndicator(true));
    putImage(name, data, jwtToken).then(() => {
      dispatch(setLoadingIndicator(false));
      toast.success(saveSuccess);
      this.setState({
        image: undefined,
        crop: DEFAULT_CROP,
        imageWidth: undefined,
        imageHeight: undefined,
        croppedFile: undefined,
      });
    }).catch((error) => {
      dispatch(setLoadingIndicator(false));
      toast.error(saveError);
      console.log(error);
    });
  }

  render() {
    const {
      dispatch,
      toggleReducer: { loading },
      municipalityReducer: { name: muniName },
      languageReducer: {
        language,
        applicationText: {
          general: { back },
          imageUpload: {
            heading, uploadArea, name, upload,
            previewSub, adjustPicture,
            crop: cropTranlation,
          },
        },
      },
    } = this.props;

    const {
      image, crop, croppedFile, fileError, errorMsg,
    } = this.state;


    return (
      !loading ?
        <div>
          <div className="media-library-view-wrapper" >
            <h2>{heading}</h2>

            <div className="media-upload-wrapper" >
              <Files
                className="files-dropzone"
                onChange={f => this.onFilesChange(f)}
                onError={(e, f) => this.onFilesError(e, f)}
                maxFileSize={20000000}
                minFileSize={0}
                accepts={['image/jpg', 'image/jpeg', 'image/png']}
                clickable
                multiple={false}
              >
                {uploadArea}
              </Files>

              {fileError && <div className="file-upload-error-message">{errorMsg}</div>}
            </div>
            { ((image && image.preview) && !fileError) &&
              <div className="preview-wrapper">
                <h3>{adjustPicture}</h3>
                <button
                  className="btn green crop"
                  onClick={() => this.cropAndCompress(image.preview.url, crop, name)}
                >
                  <img src={cutIcon} alt={cropTranlation} />
                  <span>{cropTranlation}</span>
                </button>
                <ReactCrop
                  src={image.preview ? image.preview.url : ''}
                  crop={crop}
                  onChange={c => this.onCropChange(c)}
                />
              </div>
            }

            {croppedFile &&

              <div className="media-cropper-preview" >
                <h3>{previewSub}</h3>
                <img src={croppedFile} alt={name} />
              </div>
                }
          </div>
          <div className="bottom-container">
            <button
              disabled={!croppedFile}
              className="btn green"
              onClick={() => this.submitImg()}
            >
              {upload}
            </button>
            <button
              className="btn red ml15"
              onClick={() => dispatch(push(`${PATH_PREFIX}/${language}/${muniName}/${URL_TYPES.MEDIA}`))}
            >
              {back}
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
  sessionReducer: state.SessionReducer,
  languageReducer: state.LanguageReducer,
  toggleReducer: state.ToggleReducer,
});
export default connect(mapStateToProps)(ImageUploadComponent);
