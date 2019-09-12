/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Parser } from 'html-to-react';
import { Prompt } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import InputWithLabel from './InputWithLabel';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import { setLoadingIndicator } from '../Actions/ToggleActions';
import { putMunicipality } from '../Utils/fetcherUtil';
import english from '../Images/Icons/icon_english.svg';
import swedish from '../Images/Icons/icon_swedish.svg';
import ImagePickerComponent from './ImagePickerComponent';
import { validateLength } from '../Utils/otherUtils';

class ContactComponent extends Component {
  constructor() {
    super();
    this.htmlToReactParser = new Parser();
    this.state = {
      contact: undefined,
      editingLang: undefined,
      editing: false,
      isDirty: false,
      hasError: [],
    };
  }

  componentDidMount() {
    window.addEventListener('beforeunload', e => this.onWindowUnload(e));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.municipalityReducer && nextProps.municipalityReducer.contact) {
      this.setState({
        contact: nextProps.municipalityReducer.contact,
        editingLang: nextProps.languageReducer.language,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', e => this.onWindowUnload(e));
  }

  onSectionEditorChange(e, lang) {
    const { contact } = this.state;
    contact.body[lang].content = e;
    this.setState({
      contact,
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

  submitContact() {
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

    const { contact, hasError, isDirty } = this.state;

    if (!hasError.length && isDirty) {
      dispatch(setLoadingIndicator(true));
      putMunicipality(municipalityReducer.name, { contact }, jwtToken).then(() => {
        dispatch(setLoadingIndicator(false));
        this.setState({
          isDirty: false,
          editing: undefined,
          contact,
        });
        toast.success(saveSuccess);
      }).catch((error) => {
        dispatch(setLoadingIndicator(false));
        toast.error(saveError);
        console.error(error);
      });
    }
  }

  handleEditSection(editingLang, lang) {
    const { editing } = this.state;
    if (editingLang === lang && editing) {
      this.setState({
        editing: false,
      });
    } else {
      this.setState({
        editing: true,
        editingLang: lang,
      });
    }
  }

  render() {
    const {
      toggleReducer: { loading },
      languageReducer: {
        language,
        applicationText: {
          general: {
            save, unsavedAlert,
          },
          inputWithLabel,
          startPage: {
            preview, headingContact, edit,
            stopEdit, swedishContact, englishContact, email,
          },
          tabContact: { contactPicture, svEmailBtn, enEmailBtn },
          editor,
        },
        allText,
      },
    } = this.props;

    const {
      contact,
      isDirty,
      editingLang,
      editing,
      hasError,
    } = this.state;

    const contactEditorOptions = {
      options: ['inline', 'list', 'link'],
      inline: {
        options: ['bold', 'underline'],
      },
      list: { options: ['unordered'] },
    };
    const previewFlagIcon = editingLang === 'en' ? english : swedish;

    return (
      (!loading && contact) ?
        <div>
          <div className="content-wrapper start-page-wrapper">
            <Prompt
              when={isDirty}
              message={unsavedAlert}
            />
            <h2>{headingContact}</h2>
            <div>
              <ImagePickerComponent
                imageUrl={contact.portrait}
                type="single"
                label={contactPicture}
                selectImageEvent={url =>
                  this.setState({
                    isDirty: true,
                    contact: {
                      ...contact,
                      portrait: url,
                    },
                  })}
              />
              <div className="editor-wrapper">
                <div className="start-editor-wrapper">
                  <div className="header-container">
                    {swedishContact}
                    <button
                      className="blue-link edit-icon underline"
                      onClick={() => this.handleEditSection(editingLang, 'sv')}
                    >
                      {editing && editingLang === 'sv' ? stopEdit : edit}
                    </button>
                  </div>
                  {editing && editingLang === 'sv'
                    ? <Editor
                      stripPastedStyles
                      toolbar={contactEditorOptions}
                      defaultEditorState={EditorState
                        .createWithContent(convertFromRaw(contact.body.sv.content))
                      }
                      onContentStateChange={e => this.onSectionEditorChange(e, 'sv')}
                      localization={{ translations: editor }}
                    />
                    : this.htmlToReactParser.parse(draftToHtml(contact.body.sv.content))
                  }
                </div>
                <div className="start-editor-wrapper">
                  <div className="header-container">
                    {englishContact}
                    <button
                      className="blue-link edit-icon underline"
                      onClick={() => this.handleEditSection(editingLang, 'en')}
                    >
                      {editing && editingLang === 'en' ? stopEdit : edit}
                    </button>
                  </div>
                  {editing && editingLang === 'en'
                    ? <Editor
                      stripPastedStyles
                      toolbar={contactEditorOptions}
                      defaultEditorState={EditorState
                        .createWithContent(convertFromRaw(contact.body.en.content))
                      }
                      onContentStateChange={e => this.onSectionEditorChange(e, 'en')}
                    />
                    : this.htmlToReactParser.parse(draftToHtml(contact.body.en.content))
                  }
                </div>
                <InputWithLabel
                  id="email"
                  type="text"
                  value={contact.email}
                  label={email}
                  toggleError={(id, hasErr) => this.toggleError(id, hasErr)}
                  onChange={e =>
                    this.setState({
                      isDirty: true,
                      contact: {
                        ...contact, email: e.target.value,
                      },
                    })
                  }
                  validate={[validateLength(inputWithLabel)]}
                />
                <InputWithLabel
                  id="email-btn-sv"
                  iconClass="swedish"
                  type="text"
                  value={contact.emailBtn.sv}
                  label={svEmailBtn}
                  toggleError={(id, hasErr) => this.toggleError(id, hasErr)}
                  onChange={e =>
                    this.setState({
                      editingLang: 'sv',
                      isDirty: true,
                      contact: {
                        ...contact, emailBtn: { ...contact.emailBtn, sv: e.target.value },
                      },
                   })
                  }
                  validate={[validateLength(inputWithLabel)]}
                />
                <InputWithLabel
                  id="email-btn-en"
                  iconClass="english"
                  type="text"
                  value={contact.emailBtn.en}
                  label={enEmailBtn}
                  toggleError={(id, hasErr) => this.toggleError(id, hasErr)}
                  onChange={e =>
                    this.setState({
                      editingLang: 'en',
                      isDirty: true,
                      contact: {
                        ...contact, emailBtn: { ...contact.emailBtn, en: e.target.value },
                      },
                   })
                  }
                  validate={[validateLength(inputWithLabel)]}
                />
              </div>
            </div>
            <div className="start-preview-wrapper">
              <h3>{preview} <img
                className="flag-icon"
                src={previewFlagIcon}
                alt={editingLang || language}
              />
              </h3>

              <div className="tab-wrapper" id="modal-parent">
                <div className="tab-content">
                  <div className="tab-contact-inner">
                    <h2 className="m0">{allText[editingLang]
                      ? allText[editingLang].tabContact.contact
                      : contact}
                    </h2>
                    <div
                      style={{ backgroundImage: `url(${contact.portrait})` }}
                      className="portrait"
                      alt="portrait"
                    />
                    {this.htmlToReactParser.parse(draftToHtml(contact.body[editingLang].content))}
                    <input
                      type="button"
                      value={contact.emailBtn[editingLang]}
                      className="btn green w100 mt10"
                      onClick={() => {
                        window.location.href =
                        `mailto:${contact.email}?subject=${contact.mailSubject}`;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-container">
            <button
              disabled={!isDirty || hasError.length > 0}
              className="btn green"
              onClick={() => this.submitContact()}
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

export default connect(mapStateToProps)(ContactComponent);
