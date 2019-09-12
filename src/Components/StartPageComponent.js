/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Parser } from 'html-to-react';
import { Prompt } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { capitalize } from '../Utils/otherUtils';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import { setLoadingIndicator } from '../Actions/ToggleActions';
import { putMunicipality } from '../Utils/fetcherUtil';
import english from '../Images/Icons/icon_english.svg';
import swedish from '../Images/Icons/icon_swedish.svg';
import ImagePickerComponent from './ImagePickerComponent';

class StartPageComponent extends Component {
  constructor() {
    super();
    this.htmlToReactParser = new Parser();
    this.state = {
      startPage: undefined,
      editingType: undefined,
      editingLang: undefined,
      isDirty: false,
      hasError: [],
    };
  }

  componentDidMount() {
    window.addEventListener('beforeunload', e => this.onWindowUnload(e));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.municipalityReducer.preamble && nextProps.municipalityReducer.contact) {
      this.setState({
        startPage: nextProps.municipalityReducer,
        editingLang: nextProps.languageReducer.language,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', e => this.onWindowUnload(e));
  }

  onSectionEditorChange(e, type, lang) {
    const {
      startPage,
    } = this.state;

    startPage.preamble[lang].content = e;

    this.setState({
      startPage,
      isDirty: true,
    });
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

  submitStartPage() {
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

    const { startPage, hasError, isDirty } = this.state;
    const municipalityObj = { ...startPage };

    delete municipalityObj.createdAt;
    delete municipalityObj.initialMapState;
    delete municipalityObj.contact;

    if (!hasError.length && isDirty) {
      dispatch(setLoadingIndicator(true));
      putMunicipality(municipalityReducer.name, municipalityObj, jwtToken).then(() => {
        dispatch(setLoadingIndicator(false));
        this.setState({
          isDirty: false,
          editingType: undefined,
          startPage: municipalityObj,
        });
        toast.success(saveSuccess);
      }).catch((error) => {
        dispatch(setLoadingIndicator(false));
        toast.error(saveError);
        console.log(error);
      });
    }
  }

  handleEditSection(type, lang) {
    const {
      languageReducer: { language },
    } = this.props;

    const {
      editingType,
      editingLang,
    } = this.state;

    if (type === editingType && lang === editingLang) {
      this.setState({
        editingType: undefined,
        editingLang: language,

      });
    } else {
      this.setState({
        editingType: type,
        editingLang: lang,
      });
    }
  }

  render() {
    const {
      toggleReducer: { loading },
      municipalityReducer,
      languageReducer: {
        language,
        applicationText: {
          general: {
            save, unsavedAlert, explore,
          },
          municipalityPage: {
            aboutMunicipality, aboutService, chooseLanguage, moveTo,
          },
          startPage: {
            swedishPreamble, englishPreamble,
            preview, headingStart, edit, stopEdit, backgroundImage, logo,
            pictures,
          },
          editor,
        },
        allText,
      },
    } = this.props;

    const {
      startPage,
      isDirty,
      editingType,
      editingLang,
      hasError,
    } = this.state;

    const editorOptions = {
      options: ['inline'],
      inline: {
        options: ['bold', 'underline'],
      },
    };

    const defaultFlagIcon = language === 'en' ? english : swedish;
    const previewFlagIcon = editingLang === 'en' ? english : swedish;
    return (
      !loading && (startPage && startPage.preamble) ?
        <div>
          <div className="content-wrapper start-page-wrapper">
            <Prompt
              when={isDirty}
              message={unsavedAlert}
            />

            <h2>{headingStart}</h2>
            <div className="editor-wrapper">
              <div className="start-editor-wrapper">
                <div className="header-container">
                  {swedishPreamble}
                  <button
                    className="blue-link edit-icon underline"
                    onClick={() => this.handleEditSection('start', 'sv')}
                  >
                    {editingType === 'start' && editingLang === 'sv' ? stopEdit : edit}
                  </button>
                </div>
                { editingType === 'start' && editingLang === 'sv'
            ? <Editor
              stripPastedStyles
              toolbar={editorOptions}
              defaultEditorState={EditorState
                .createWithContent(convertFromRaw(startPage.preamble.sv.content))
              }
              onContentStateChange={e => this.onSectionEditorChange(e, 'start', 'sv')}
              localization={{ translations: editor }}
            />
            : this.htmlToReactParser.parse(draftToHtml(startPage.preamble.sv.content))
          }
              </div>
              <div className="start-editor-wrapper">
                <div className="header-container">
                  {englishPreamble}
                  <button
                    className="blue-link edit-icon underline"
                    onClick={() => this.handleEditSection('start', 'en')}
                  >
                    {editingType === 'start' && editingLang === 'en' ? stopEdit : edit }
                  </button>
                </div>
                {editingType === 'start' && editingLang === 'en'
            ? <Editor
              stripPastedStyles
              toolbar={editorOptions}
              defaultEditorState={EditorState
                .createWithContent(convertFromRaw(startPage.preamble.en.content))
              }
              onContentStateChange={e => this.onSectionEditorChange(e, 'start', 'en')}
            />
            : this.htmlToReactParser.parse(draftToHtml(startPage.preamble.en.content))
          }
              </div>
              <h3>{pictures}</h3>
              <div className="image-picker-row">
                <ImagePickerComponent
                  imageUrl={startPage.logoImage}
                  type="single"
                  label={logo}
                  selectImageEvent={url =>
                  this.setState({
                    isDirty: true,
                    startPage: {
                      ...startPage,
                      logoImage: url,
                    },
                  })}
                />
                <ImagePickerComponent
                  imageUrl={startPage.backgroundImage}
                  type="single"
                  label={backgroundImage}
                  selectImageEvent={url =>
                  this.setState({
                    isDirty: true,
                    startPage: {
                      ...startPage,
                      backgroundImage: url,
                    },
                  })}
                />
              </div>
              <div className="clear" />
            </div>
            <div>
              <div className="start-preview-wrapper">
                <h3>{preview} <img
                  className="flag-icon"
                  src={editingType === 'start' ? previewFlagIcon : defaultFlagIcon}
                  alt={editingLang || language}
                />
                </h3>
                <div className="start-preview-container">
                  <div className="bg-image-container" style={{ backgroundImage: `url(${startPage.backgroundImage})` }}>
                    <div className="bg-overlay" >
                      <div className="wrapper">
                        <div className="row collapse">
                          <div className="columns small-6 medium-3 logo-container">
                            <img src={startPage.logoImage} alt={`${municipalityReducer.name} logo`} />
                          </div>
                          <div className="columns small-6 medium-9">
                            {
                          (editingType === 'start' && allText[editingLang]) ?
                            <div className="top-menu">
                              <ul>
                                <li>{allText[editingLang].municipalityPage.aboutMunicipality}</li>
                                <li>{allText[editingLang].municipalityPage.aboutService}</li>
                                <li>{allText[editingLang].municipalityPage.chooseLanguage}</li>
                              </ul>
                            </div>
                      :
                            <div className="top-menu">
                              <ul>
                                <li>{aboutMunicipality}</li>
                                <li>{aboutService}</li>
                                <li>{chooseLanguage}</li>
                              </ul>
                            </div>

                      }
                          </div>
                        </div>
                        <div className="row collapse text-wrapper">
                          <div className="ta-center">
                            <h1>{(editingType === 'start' && allText[editingLang]
                        ? allText[editingLang].municipalityPage.moveTo : moveTo)
                        + capitalize(municipalityReducer.name)}
                            </h1>
                          </div>
                          <div className="ta-center preamble">
                            {
                        (startPage && startPage.preamble) && this.htmlToReactParser
                        .parse(draftToHtml(startPage.preamble[editingType === 'start' ? editingLang : language].content))
                      }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="explore-placeholder btn-content">
                  <p>{explore}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-container">
            <button
              disabled={!isDirty || hasError.length > 0}
              className="btn green"
              onClick={() => this.submitStartPage()}
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

export default connect(mapStateToProps)(StartPageComponent);
