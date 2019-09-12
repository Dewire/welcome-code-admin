/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw } from 'draft-js';
import { Parser } from 'html-to-react';
import draftToHtml from 'draftjs-to-html';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import { Prompt } from 'react-router-dom';
import { setLoadingIndicator } from '../Actions/ToggleActions';
import { receiveAboutMunicipalityData } from '../Actions/AboutMunicipalityActions';
import { putAboutMunicipality } from '../Utils/fetcherUtil';
import { SECTION_TYPE } from '../Constants';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import InputWithLabel from './InputWithLabel';
import ImagePickerComponent from './ImagePickerComponent';
import { validateLength } from '../Utils/otherUtils';

// TODO: Refactor this class and AreaDetailsComponent since code is so similar

class AboutMunicipalityComponent extends Component {
  constructor() {
    super();

    this.htmlToReactParser = new Parser();

    this.state = {
      aboutMunicipality: undefined,
      openAddSectionPopup: undefined,
      editingSectionIndex: undefined,
      isDirty: false,
      hasError: [],
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', e => this.resetAddSectionPopup(e));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.aboutMunicipalityReducer.municipalityId &&
      !this.state.aboutMunicipality) {
      this.setState({
        aboutMunicipality: nextProps.aboutMunicipalityReducer,
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', e => this.resetAddSectionPopup(e));
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

  onSectionEditorChange(e, index, lang) {
    const {
      aboutMunicipality,
    } = this.state;

    if (index) {
      aboutMunicipality.content.section.find(s => s.index === index).content[lang].text =
        e;
    } else {
      aboutMunicipality.content.topContent[lang].text = e;
    }

    this.setState({
      aboutMunicipality,
      isDirty: true,
    });
  }

  onSectionHeaderChange(e, index, lang) {
    const {
      aboutMunicipality,
    } = this.state;

    if (index) {
      aboutMunicipality.content.section.find(s => s.index === index).content[lang].header =
        e.target.value;
    } else {
      aboutMunicipality.content.topContent[lang].header = e.target.value;
    }

    this.setState({
      aboutMunicipality,
      isDirty: true,
    });
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

  resetAddSectionPopup(e) {
    if (!e.target.classList.contains('add-icon') &&
      !e.target.classList.contains('add-section')) {
      this.setState({
        openAddSectionPopup: undefined,
      });
    }
  }

  toggleAddSectionPopup(index) {
    this.setState({
      openAddSectionPopup: index,
    });
  }

  handleEditSection(index) {
    const {
      editingSectionIndex,
    } = this.state;

    const rtnIndex = editingSectionIndex === index ? undefined : index;

    this.setState({
      editingSectionIndex: rtnIndex,
      isDirty: true,
    });
  }

  handleRemoveCarouselImage(index, imgIndex) {
    const {
      aboutMunicipality,
    } = this.state;

    const imgSection = aboutMunicipality.content.section.find(s => s.index === index);
    const newImages = imgSection.carouselUrls.filter(s => s.index !== imgIndex);
    newImages.forEach((s, i) => { s.index = i + 1; });
    imgSection.carouselUrls = newImages;

    this.setState({
      aboutMunicipality,
      isDirty: true,
    });
  }

  handleAddCarouselImage(index, url) {
    const {
      aboutMunicipality,
    } = this.state;

    const imgSection = aboutMunicipality.content.section.find(s => s.index === index);
    const newImages = imgSection.carouselUrls;
    newImages.push({ index: 0, url });
    newImages.forEach((s, i) => { s.index = i + 1; });
    imgSection.carouselUrls = newImages;

    this.setState({
      aboutMunicipality,
      isDirty: true,
    });
  }

  handleRemoveSection(index) {
    const {
      aboutMunicipality,
    } = this.state;

    const newSections = aboutMunicipality.content.section.filter(s => s.index !== index);
    newSections.forEach((s, i) => { s.index = i + 1; });

    this.setState({
      aboutMunicipality: {
        ...aboutMunicipality,
        content: {
          ...aboutMunicipality.content,
          section: newSections,
        },
      },
      isDirty: true,
    });
  }

  handleMoveSection(index, movement) {
    const {
      aboutMunicipality,
    } = this.state;

    aboutMunicipality.content.section.find(s => s.index === index).index = undefined;
    aboutMunicipality.content.section.find(s => s.index === index + movement).index = index;
    aboutMunicipality.content.section.find(s => s.index === undefined).index = index + movement;

    this.setState({
      aboutMunicipality,
      isDirty: true,
    });
  }

  handleAddNewSection(index, type) {
    const {
      aboutMunicipality,
    } = this.state;

    const defaultTextSectionObject = {
      type,
      index,
      content: {
        sv: {
          header: 'Lägg till en rubrik',
          text: {
            blocks: [
              {
                key: '',
                text: 'Lägg till text här.',
                type: 'unstyled',
                depth: 0,
                inlineStyleRanges: [

                ],
                entityRanges: [

                ],
                data: {

                },
              },
            ],
            entityMap: {
            },
          },
        },
        en: {
          header: 'Add a header here',
          text: {
            blocks: [
              {
                key: '',
                text: 'Add text here.',
                type: 'unstyled',
                depth: 0,
                inlineStyleRanges: [

                ],
                entityRanges: [

                ],
                data: {

                },
              },
            ],
            entityMap: {
            },
          },
        },
      },
    };

    const defaultImageSectionObject = {
      type,
      index,
      carouselUrls: [],
    };

    switch (type) {
      case SECTION_TYPE.TEXT:
        aboutMunicipality.content.section
          .push(defaultTextSectionObject);
        break;
      case SECTION_TYPE.IMAGES:
        aboutMunicipality.content.section
          .push(defaultImageSectionObject);
        break;
      default:
        aboutMunicipality.content.section
          .push({ index, type });
    }

    aboutMunicipality.content.section
      .sort((a, b) => a.index - b.index).forEach((se, i) => { se.index = i + 1; });

    this.setState({
      openAddSectionPopup: undefined,
      aboutMunicipality: {
        ...aboutMunicipality,
        content: {
          ...aboutMunicipality.content,
          section: aboutMunicipality.content.section,
        },
      },
      isDirty: true,
    });
  }

  submitAboutMunicipality() {
    const {
      dispatch,
      sessionReducer: {
        authObject: {
          signInUserSession: { idToken: { jwtToken } },
        },
      },
      aboutMunicipalityReducer: { municipalityId },
      languageReducer: {
        applicationText: {
          general: {
            saveSuccess, saveError,
          },
        },
      },
    } = this.props;
    const { aboutMunicipality, hasError, isDirty } = this.state;

    delete aboutMunicipality.createdAt;

    if (!hasError.length && isDirty) {
      dispatch(setLoadingIndicator(true));
      putAboutMunicipality(municipalityId, aboutMunicipality, jwtToken).then((resp) => {
        dispatch(setLoadingIndicator(false));
        this.setState({
          isDirty: false,
          openAddSectionPopup: undefined,
          editingSectionIndex: undefined,
        });
        dispatch(receiveAboutMunicipalityData(resp.data));
        toast.success(saveSuccess);
      }).catch((error) => {
        dispatch(setLoadingIndicator(false));
        toast.error(saveError);
        console.log(error);
      });
    }
  }

  renderAddSectionPopup(index) {
    const {
      languageReducer: {
        applicationText: {
          general: { section },
        },
      },
    } = this.props;

    const {
      openAddSectionPopup,
      aboutMunicipality: {
        content,
      },
    } = this.state;

    return (
      <div>
        <button
          className="blue-link add-icon underline"
          onClick={() => this.toggleAddSectionPopup(index)}
        >{`${section.add} ${section.newSection}`}
        </button>
        {
          openAddSectionPopup === index &&
          <div className="add-section-popup-wrapper">
            <div className="top-arrow" />
            <div className="add-section-popup">
              <button
                className="blue-link add-section underline"
                onClick={() => this.handleAddNewSection(index, SECTION_TYPE.TEXT)}
              >{`${section.add} ${section[SECTION_TYPE.TEXT]}`}
              </button>
              <button
                className="blue-link add-section underline"
                onClick={() => this.handleAddNewSection(index, SECTION_TYPE.IMAGES)}
              >{`${section.add} ${section[SECTION_TYPE.IMAGES]}`}
              </button>
              {!content.section.find(s => s.type === SECTION_TYPE.DISTANCE_TABLE) &&
                <button
                  className="blue-link add-section underline"
                  onClick={() => this.handleAddNewSection(index, SECTION_TYPE.DISTANCE_TABLE)}
                >{`${section.add} ${section[SECTION_TYPE.DISTANCE_TABLE]}`}
                </button>}
            </div>
          </div>
        }
      </div>
    );
  }

  renderAboutSections() {
    const {
      languageReducer: {
        applicationText: {
          general: { section },
          inputWithLabel,
        },
      },
    } = this.props;

    const {
      aboutMunicipality,
      editingSectionIndex,
    } = this.state;

    const editorOptions = {
      options: ['inline', 'link', 'list'],
      inline: {
        options: ['bold', 'underline'],
      },
    };

    if (aboutMunicipality) {
      aboutMunicipality.content.section =
        aboutMunicipality.content.section ? aboutMunicipality.content.section : [];
    }

    const sectionsMarkup = aboutMunicipality &&
        (
          <div>
            <div className="section">
              <div className="type">
                {section.preamble}
                <button
                  className="blue-link edit-icon underline"
                  onClick={() => this.handleEditSection(0)}
                >
                  {editingSectionIndex === 0 ? section.stopEdit : section.edit }
                </button>
              </div>
              <div className={classNames('editor-fields', { editing: editingSectionIndex === 0 })}>
                {
              editingSectionIndex === 0 &&
              <div>
                <InputWithLabel
                  id="preamble_sv0"
                  type="text"
                  value={aboutMunicipality.content.topContent.sv.header}
                  toggleError={(id, hasErr) => this.toggleError(id, hasErr)}
                  onChange={e => this.onSectionHeaderChange(e, 0, 'sv')}
                  validate={[validateLength(inputWithLabel)]}
                  iconClass="swedish"
                />
                <Editor
                  stripPastedStyles
                  toolbar={editorOptions}
                  defaultEditorState={
                    EditorState
                    .createWithContent(convertFromRaw(aboutMunicipality
                      .content.topContent.sv.text))
                  }
                  onContentStateChange={e => this.onSectionEditorChange(e, 0, 'sv')}
                />
              </div>
            }
              </div>
              <div className="header">
                <h2>{aboutMunicipality.content.topContent.sv.header}</h2>
              </div>
              <div className="content">
                {this.htmlToReactParser.parse(draftToHtml(aboutMunicipality
                  .content.topContent.sv.text))}
              </div>
              <hr className="divider dashed" />
              <div className={classNames('editor-fields', { editing: editingSectionIndex === 0 })}>
                {
              editingSectionIndex === 0 &&
                <div>
                  <InputWithLabel
                    id="preamble_en0"
                    type="text"
                    value={aboutMunicipality.content.topContent.en.header}
                    toggleError={(id, hasErr) => this.toggleError(id, hasErr)}
                    onChange={e => this.onSectionHeaderChange(e, 0, 'en')}
                    validate={[validateLength(inputWithLabel)]}
                    iconClass="english"
                  />
                  <Editor
                    stripPastedStyles
                    toolbar={editorOptions}
                    defaultEditorState={
                    EditorState
                    .createWithContent(convertFromRaw(aboutMunicipality
                      .content.topContent.en.text))
                  }
                    onContentStateChange={e => this.onSectionEditorChange(e, 0, 'en')}
                  />
                </div>
            }
              </div>
              <div className="header">
                <h2>{aboutMunicipality.content.topContent.en.header}</h2>
              </div>
              <div className="content">
                {this.htmlToReactParser.parse(draftToHtml(aboutMunicipality
                  .content.topContent.en.text))}
              </div>
              {this.renderAddSectionPopup(0)}
            </div>
            {aboutMunicipality.content.section.sort((a, b) => a.index > b.index).map(s =>
            (
              <div key={s.index} className="section">
                {s.index === 1 && <hr className="divider" />}
                <div className="type">
                  {section[s.type]}
                  {
                    s.type === SECTION_TYPE.TEXT &&
                    <button
                      className="blue-link edit-icon underline"
                      onClick={() => this.handleEditSection(s.index)}
                    >
                      {editingSectionIndex === s.index ? section.stopEdit : section.edit }
                    </button>
                  }

                  <button
                    className="red-link remove-icon"
                    onClick={() => this.handleRemoveSection(s.index)}
                  >
                    {section.remove}
                  </button>
                </div>
                {
                  (s.type === SECTION_TYPE.TEXT) &&
                  <div>
                    <div className={classNames('editor-fields', { editing: editingSectionIndex === s.index })}>
                      {
                    editingSectionIndex === s.index &&
                      <div>
                        <InputWithLabel
                          id={`header_sv${s.index}`}
                          type="text"
                          value={s.content.sv.header}
                          toggleError={(id, hasErr) => this.toggleError(id, hasErr)}
                          onChange={e => this.onSectionHeaderChange(e, s.index, 'sv')}
                          validate={[validateLength(inputWithLabel)]}
                          iconClass="swedish"
                        />
                        <Editor
                          stripPastedStyles
                          toolbar={editorOptions}
                          defaultEditorState={
                          EditorState
                          .createWithContent(convertFromRaw(s.content.sv.text))
                        }
                          onContentStateChange={e => this.onSectionEditorChange(e, s.index, 'sv')}
                        />
                      </div>
                  }
                    </div>
                    <div className="header"><h2>{s.content.sv.header}</h2></div>
                    <div className="content">
                      {this.htmlToReactParser.parse(draftToHtml(s.content.sv.text))}
                    </div>
                    <hr className="divider dashed" />
                    <div className={classNames('editor-fields', { editing: editingSectionIndex === s.index })}>
                      {
                    editingSectionIndex === s.index &&
                      <div>
                        <InputWithLabel
                          id={`header_en${s.index}`}
                          type="text"
                          value={s.content.en.header}
                          onChange={e => this.onSectionHeaderChange(e, s.index, 'en')}
                          toggleError={(id, hasErr) => this.toggleError(id, hasErr)}
                          validate={[validateLength(inputWithLabel)]}
                          iconClass="english"
                        />
                        <Editor
                          stripPastedStyles
                          toolbar={editorOptions}
                          defaultEditorState={
                          EditorState
                          .createWithContent(convertFromRaw(s.content.en.text))
                        }
                          onContentStateChange={e => this.onSectionEditorChange(e, s.index, 'en')}
                        />
                      </div>
                  }
                    </div>
                    <div className="header"><h2>{s.content.en.header}</h2></div>
                    <div className="content">
                      {this.htmlToReactParser.parse(draftToHtml(s.content.en.text))}
                    </div>
                  </div>
                }
                {
                  (s.type === SECTION_TYPE.IMAGES) &&
                  <div>
                    <ImagePickerComponent
                      imageArray={s.carouselUrls}
                      removeImageEvent={i => this.handleRemoveCarouselImage(s.index, i)}
                      selectImageEvent={url => this.handleAddCarouselImage(s.index, url)}
                    />
                  </div>
                }
                {s.index !== 1 &&
                  <button
                    className="btn move down"
                    onClick={() => this.handleMoveSection(s.index, -1)}
                  />}
                {s.index !== aboutMunicipality.content.section.length &&
                  <button
                    className="btn move up"
                    onClick={() => this.handleMoveSection(s.index, 1)}
                  />}
                {this.renderAddSectionPopup(s.index)}
                <hr className="divider" />
              </div>
            ))}
          </div>
        );

    return (
      aboutMunicipality &&
        <div>
          {sectionsMarkup}
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
          aboutMunicipality: {
            heading,
          },
        },
      },
    } = this.props;

    const {
      aboutMunicipality, isDirty, hasError,
    } = this.state;

    const content = aboutMunicipality &&
    <div>
      {this.renderAboutSections()}
    </div>;

    return (
      !loading ?
        <div>
          <Prompt
            when={isDirty}
            message={unsavedAlert}
          />
          <div className="content-wrapper area-details-wrapper">
            <h2>{heading}</h2>
            {content}
          </div>
          <div className="bottom-container">
            <button
              disabled={!isDirty || hasError.length > 0}
              className="btn green"
              onClick={() => this.submitAboutMunicipality()}
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
  sessionReducer: state.SessionReducer,
  aboutMunicipalityReducer: state.AboutMunicipalityReducer,
  languageReducer: state.LanguageReducer,
  toggleReducer: state.ToggleReducer,
});
export default connect(mapStateToProps)(AboutMunicipalityComponent);
