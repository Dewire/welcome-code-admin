/* eslint-env browser */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw } from 'draft-js';
import { Parser } from 'html-to-react';
import draftToHtml from 'draftjs-to-html';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import { generate } from 'shortid';
import { Prompt } from 'react-router-dom';
import { setLoadingIndicator, setShowSuccessToast } from '../Actions/ToggleActions';
import { putArea, deleteArea, fetchAreaOverview } from '../Utils/fetcherUtil';
import { SECTION_TYPE, URL_TYPES, PATH_PREFIX } from '../Constants';
import InputWithLabel from './InputWithLabel';
import MapViewComponent from './MapViewComponent';
import AreaListComponent from './AreaListComponent';
import LoadingIndicatorComponent from './LoadingIndicatorComponent';
import ImagePickerComponent from './ImagePickerComponent';
import { validateAreaName, validateLength } from '../Utils/otherUtils';

// TODO: Refactor this class and AboutMunicipalityComponent since code is so similar

class AreaDetailsComponent extends Component {
  constructor() {
    super();

    this.htmlToReactParser = new Parser();

    this.state = {
      newArea: false,
      area: undefined,
      areaOverview: undefined,
      openAddSectionPopup: undefined,
      editingSectionIndex: undefined,
      isDirty: false,
      hasError: [],
      removePopup: { visible: false },
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', e => this.resetAddSectionPopup(e));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.toggleReducer && nextProps.toggleReducer.showSuccessToast
      && !nextProps.toggleReducer.loading && !this.state.newArea) {
      this.showSuccessToast();
    }
    if (nextProps.municipalityReducer !==
      this.props.municipalityReducer) {
      this.newAreaCheck(nextProps.municipalityReducer);
    }
    if (nextProps.areaOverviewReducer.areaOverview &&
        !this.state.area) {
      const { areas } = nextProps.areaReducer;
      const { areaOverview } = nextProps.areaOverviewReducer;
      const areaInList = areas && areas.find(a => a.areaId === areaOverview.areaId);

      this.setState({
        area: areaInList,
        areaOverview,
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
      areaOverview,
    } = this.state;

    if (index) {
      areaOverview.section.find(s => s.index === index).content[lang].text =
        e;
    } else {
      areaOverview.preamble[lang].content = e;
    }

    this.setState({
      areaOverview,
      isDirty: true,
    });
  }

  onSectionHeaderChange(e, index, lang) {
    const {
      areaOverview,
    } = this.state;

    areaOverview.section.find(s => s.index === index).content[lang].header =
      e.target.value;

    this.setState({
      areaOverview,
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

  newAreaCheck(municipalityReducer) {
    const {
      match: { params: { areaId } },
    } = this.props;
    const { municipalityId, backgroundImage, initialMapState: { center } } = municipalityReducer;
    const newArea = areaId === 'new';
    const area = {
      name: 'Nytt område',
      areaId: generate(),
      municipalityId,
      coordinates: center,
      nyko: [],
      thumbnail: backgroundImage,
      housingType: [],
    };

    this.setState({
      newArea,
      area: newArea ? area : undefined,
    });
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

  submitArea() {
    const {
      dispatch,
      sessionReducer: {
        authObject: {
          signInUserSession: { idToken: { jwtToken } },
        },
      },
      municipalityReducer: { municipalityId, name, backgroundImage },
      languageReducer: {
        language,
        applicationText: {
          general: {
            saveError,
          },
        },
      },
    } = this.props;
    const {
      area, areaOverview, hasError, isDirty, newArea,
    } = this.state;

    if (!hasError.length && isDirty) {
      // Fix for not saving area image carousel wo image.
      areaOverview.carouselUrls = areaOverview.carouselUrls.length > 0 ?
        areaOverview.carouselUrls : [{ index: 1, url: backgroundImage }];

      dispatch(setLoadingIndicator(true));
      putArea(municipalityId, { area, areaOverview }, jwtToken).then(() => {
        this.setState({
          isDirty: false,
          openAddSectionPopup: undefined,
          editingSectionIndex: undefined,
        });

        if (newArea) {
          dispatch(setShowSuccessToast(true));
          dispatch(push(`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.AREA}/${area.areaId}`));
        } else {
          dispatch(setLoadingIndicator(false));
          this.showSuccessToast();
        }
      }).catch((error) => {
        dispatch(setLoadingIndicator(false));
        toast.error(saveError);
        console.log(error);
      });
    }
  }

  removeArea() {
    const {
      dispatch,
      sessionReducer: {
        authObject: {
          signInUserSession: { idToken: { jwtToken } },
        },
      },
      municipalityReducer: { municipalityId, name },
      languageReducer: {
        language,
        applicationText: {
          general: {
            saveError,
          },
        },
      },
    } = this.props;

    const {
      area, areaOverview,
    } = this.state;

    dispatch(setLoadingIndicator(true));
    deleteArea(municipalityId, { area, areaOverview }, jwtToken).then(() => {
      dispatch(setShowSuccessToast(true));
      dispatch(push(`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.AREAS}`));
    }).catch((error) => {
      dispatch(setLoadingIndicator(false));
      toast.error(saveError);
      console.log(error);
    });
  }

  handleHousingOnChange(val, type) {
    const { area, area: { housingType } } = this.state;
    const newArray = housingType || [];

    if (val) {
      newArray.push(type);
    } else {
      newArray.splice(newArray.indexOf(type), 1);
    }

    this.setState({ area: { ...area, housingType: newArray }, isDirty: true });
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

  handleRemoveSection(index) {
    const {
      areaOverview,
    } = this.state;

    const newSections = areaOverview.section.filter(s => s.index !== index);
    newSections.forEach((s, i) => { s.index = i + 1; });

    this.setState({
      areaOverview: {
        ...areaOverview,
        section: newSections,
      },
      isDirty: true,
    });
  }

  handleMoveSection(index, movement) {
    const {
      areaOverview,
    } = this.state;

    areaOverview.section.find(s => s.index === index).index = undefined;
    areaOverview.section.find(s => s.index === index + movement).index = index;
    areaOverview.section.find(s => s.index === undefined).index = index + movement;

    this.setState({
      areaOverview,
      isDirty: true,
    });
  }

  handleAddNewSection(index, type) {
    const {
      areaOverview,
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
        areaOverview.section
          .push(defaultTextSectionObject);
        break;
      case SECTION_TYPE.IMAGES:
        areaOverview.section
          .push(defaultImageSectionObject);
        break;
      default:
        areaOverview.section
          .push({ index, type });
    }

    areaOverview.section
      .sort((a, b) => a.index - b.index).forEach((se, i) => { se.index = i + 1; });

    this.setState({
      openAddSectionPopup: undefined,
      areaOverview: {
        ...areaOverview,
        section: areaOverview.section,
      },
      isDirty: true,
    });
  }

  handleSelectAreaToCopy(a) {
    const emptyAreaOverview = {
      carouselUrls: [],
      preamble: {
        sv: {
          content: {
            blocks: [
              {
                key: '',
                text: 'Lägg till ingress.',
                type: 'unstyled',
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
              },
            ],
            entityMap: {},
          },
        },
        en: {
          content: {
            blocks: [
              {
                key: '',
                text: 'Add preamble.',
                type: 'unstyled',
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
              },
            ],
            entityMap: {},
          },
        },
      },
      section: [],
    };

    if (a) {
      fetchAreaOverview(a.areaId).then((response) => {
        this.setState({
          areaOverview: {
            ...response.data,
            areaId: this.state.area.areaId,
            id: generate(),
          },
        });
      });
    } else {
      this.setState({
        areaOverview: {
          ...emptyAreaOverview,
          areaId: this.state.area.areaId,
          id: generate(),
        },
      });
    }
  }

  handleRemoveCarouselImage(index, imgIndex) {
    const {
      areaOverview,
    } = this.state;

    if (index) {
      const newSections = areaOverview.section;
      const newSection = newSections.find(s => s.index === index);
      const newImages = newSection.carouselUrls.filter(s => s.index !== imgIndex);
      newImages.forEach((s, i) => { s.index = i + 1; });
      newSection.carouselUrls = newImages;

      this.setState({
        areaOverview: {
          ...areaOverview,
          section: newSections,
        },
        isDirty: true,
      });
    } else { // Top carousel
      const newImages = areaOverview.carouselUrls.filter(s => s.index !== imgIndex);
      newImages.forEach((s, i) => { s.index = i + 1; });

      this.setState({
        areaOverview: {
          ...areaOverview,
          carouselUrls: newImages,
        },
        isDirty: true,
      });
    }
  }

  handleAddCarouselImage(index, url) {
    const {
      areaOverview,
    } = this.state;

    if (index) {
      const newSections = areaOverview.section;
      const newSection = newSections.find(s => s.index === index);
      const newImages = newSection.carouselUrls;
      newImages.push({ index: 0, url });
      newImages.forEach((s, i) => { s.index = i + 1; });
      newSection.carouselUrls = newImages;

      this.setState({
        areaOverview: {
          ...areaOverview,
          section: newSections,
        },
        isDirty: true,
      });
    } else { // Top carousel
      const newImages = areaOverview.carouselUrls;
      newImages.push({ index: 0, url });
      newImages.forEach((s, i) => { s.index = i + 1; });

      this.setState({
        areaOverview: {
          ...areaOverview,
          carouselUrls: newImages,
        },
        isDirty: true,
      });
    }
  }

  renderRemovePopup() {
    const {
      area: { name },
    } = this.state;

    const {
      languageReducer: {
        applicationText: {
          areaOverview: { removeAreYouSurePt1, removeAreYouSurePt2 },
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
            onClick={() => this.removeArea()}
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

  renderAreaInputs() {
    const {
      languageReducer: {
        applicationText: {
          areaOverview: { areaDetails },
          inputWithLabel: { invalidCharacters },
          inputWithLabel,
        },
      },
      municipalityReducer: { initialMapState },
      areaReducer: { areas },
    } = this.props;

    const { area, newArea } = this.state;

    return (
      (area && areas) &&
      <div>
        <h3>{areaDetails.mapTitle}</h3>
        <div className="map-card-wrapper">
          <MapViewComponent
            openArea={area}
            newArea={newArea}
            MapViewReducer={
              { ...initialMapState, center: area.coordinates }
            }
            onAreaCoordinatesChange={coordinates =>
              this.setState({
                  isDirty: true,
                  area: {
                    ...area,
                    coordinates: { lat: coordinates.lat, long: coordinates.lng },
                  },
                 })
               }
          />
        </div>
        <h3>{areaDetails.commonTitle}</h3>
        <ImagePickerComponent
          imageUrl={area.thumbnail}
          type="single"
          label={areaDetails.thumbnail}
          selectImageEvent={url =>
            this.setState({ area: { ...area, thumbnail: url }, isDirty: true })}
        />
        <InputWithLabel
          id="name"
          type="text"
          value={area.name}
          label={areaDetails.name}
          toggleError={(id, hasErr) => this.toggleError(id, hasErr)}
          onChange={e =>
            this.setState({ area: { ...area, name: e.target.value }, isDirty: true })}
          validate={[
            validateAreaName(invalidCharacters),
            validateLength(inputWithLabel),
           ]}
        />
        <InputWithLabel
          id="nyko"
          type="text"
          value={area.nyko ? area.nyko.join(',') : ''}
          label={areaDetails.nyko}
          onChange={e =>
            this.setState({
                isDirty: true,
                area: {
                    ...area,
                    nyko: e.target.value.split(','),
                  },
               })
          }
        />
        <strong>{areaDetails.housingTypes.title}</strong>
        <div className="housing-checkbox-container">
          <InputWithLabel
            id="ht_apartments"
            type="checkbox"
            checked={area.housingType && area.housingType.indexOf(1) > -1}
            label={areaDetails.housingTypes.apartment}
            onChange={e => this.handleHousingOnChange(e.target.checked, 1)}
          />
          <InputWithLabel
            id="ht_houses"
            type="checkbox"
            checked={area.housingType && area.housingType.indexOf(2) > -1}
            label={areaDetails.housingTypes.house}
            onChange={e => this.handleHousingOnChange(e.target.checked, 2)}
          />
        </div>
        <div className="clear" />
      </div>
    );
  }

  renderAreaOverviewInputs() {
    const {
      languageReducer: {
        applicationText: {
          areaOverview: {
            areaOverv: {
              imageCarousel,
              contentTitle,
            },
          },
        },
      },
    } = this.props;

    const {
      areaOverview,
    } = this.state;

    const imageCarouselMarkup = areaOverview &&
      (
        <div>
          <ImagePickerComponent
            imageArray={areaOverview.carouselUrls}
            removeImageEvent={i => this.handleRemoveCarouselImage(0, i)}
            selectImageEvent={url => this.handleAddCarouselImage(0, url)}
          />
        </div>
      );

    return (
      <div>
        <h3>{contentTitle}</h3>
        {
          areaOverview &&
          <div>
            <strong>{imageCarousel}</strong>
            {imageCarouselMarkup}
          </div>
      }
      </div>

    );
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
      areaOverview,
      openAddSectionPopup,
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
              {!areaOverview.section.find(s => s.type === SECTION_TYPE.STREET_VIEW) &&
                <button
                  className="blue-link add-section underline"
                  onClick={() => this.handleAddNewSection(index, SECTION_TYPE.STREET_VIEW)}
                >{`${section.add} ${section[SECTION_TYPE.STREET_VIEW]}`}
                </button>}
              {!areaOverview.section.find(s => s.type === SECTION_TYPE.COMMUTE_TIME) &&
                <button
                  className="blue-link add-section underline"
                  onClick={() => this.handleAddNewSection(index, SECTION_TYPE.COMMUTE_TIME)}
                >{`${section.add} ${section[SECTION_TYPE.COMMUTE_TIME]}`}
                </button>}
              {!areaOverview.section.find(s => s.type === SECTION_TYPE.HOUSE_LISTINGS) &&
                <button
                  className="blue-link add-section underline"
                  onClick={() => this.handleAddNewSection(index, SECTION_TYPE.HOUSE_LISTINGS)}
                >{`${section.add} ${section[SECTION_TYPE.HOUSE_LISTINGS]}`}
                </button>}
            </div>
          </div>
        }
      </div>
    );
  }

  renderAreaSections() {
    const {
      languageReducer: {
        applicationText: {
          general: { section },
          inputWithLabel,
        },
      },
    } = this.props;

    const {
      areaOverview,
      editingSectionIndex,
    } = this.state;

    const editorOptions = {
      options: ['inline', 'link', 'list'],
      inline: {
        options: ['bold', 'underline'],
      },
    };

    if (areaOverview) { areaOverview.section = areaOverview.section ? areaOverview.section : []; }

    const sectionsMarkup = areaOverview &&
      (
        <div>
          <div className="section">
            <hr className="divider" />
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
              <div className="swedish" />
              <Editor
                stripPastedStyles
                toolbar={editorOptions}
                defaultEditorState={
                  EditorState
                  .createWithContent(convertFromRaw(areaOverview.preamble.sv.content))
                }
                onContentStateChange={e => this.onSectionEditorChange(e, 0, 'sv')}
              />
            </div>
          }
            </div>
            <div className="content">
              {this.htmlToReactParser.parse(draftToHtml(areaOverview.preamble.sv.content))}
            </div>
            <hr className="divider dashed" />
            <div className={classNames('editor-fields', { editing: editingSectionIndex === 0 })}>
              {
            editingSectionIndex === 0 &&
              <div>
                <div className="english" />
                <Editor
                  stripPastedStyles
                  toolbar={editorOptions}
                  defaultEditorState={
                  EditorState
                  .createWithContent(convertFromRaw(areaOverview.preamble.en.content))
                }
                  onContentStateChange={e => this.onSectionEditorChange(e, 0, 'en')}
                />
              </div>
          }
            </div>
            <div className="content">
              {this.htmlToReactParser.parse(draftToHtml(areaOverview.preamble.en.content))}
            </div>
            {this.renderAddSectionPopup(0)}
            <hr className="divider" />
          </div>
          {areaOverview.section.sort((a, b) => a.index > b.index).map(s =>
          (
            <div key={s.index} className="section">
              <div className="type">
                {section[s.type]}
                {
                  (s.type === SECTION_TYPE.TEXT) &&
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
              {s.index !== areaOverview.section.length &&
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
      areaOverview &&
      <div>
        {sectionsMarkup}
      </div>
    );
  }

  renderAreaPicker() {
    const {
      languageReducer: {
        applicationText: {
          areaOverview: {
            areaPicker: {
              heading, description, here,
            },
          },
        },
      },
    } = this.props;

    return (
      <div className="area-picker">
        <h3>{heading}</h3>
        <p className="description">
          {description}
          <button
            className="blue-link underline f16"
            onClick={() => {
              this.handleSelectAreaToCopy();
          }}
          >
            {here}
          </button>.
        </p>
        <AreaListComponent areaOnClick={(a) => {
            this.handleSelectAreaToCopy(a);
        }}
        />
      </div>
    );
  }

  render() {
    const {
      dispatch,
      toggleReducer: { loading },
      municipalityReducer: { name },
      languageReducer: {
        language,
        applicationText: {
          general: {
            save, cancel, unsavedAlert,
          },
          areaOverview: {
            headingEdit, headingAdd, removeArea,
          },
        },
      },
    } = this.props;

    const {
      newArea, areaOverview, isDirty, hasError, removePopup,
    } = this.state;

    const content = newArea && !areaOverview ?
      (<div>{this.renderAreaPicker()}</div>)
      :
      (
        <div>
          {!newArea &&
          <div className="top-button-container">
            <button
              className="red-link remove-icon"
              onClick={() => this.setState({ removePopup: { visible: true } })}
            >
              {removeArea}
            </button>
          </div>}
          {this.renderAreaInputs()}
          {this.renderAreaOverviewInputs()}
          {this.renderAreaSections()}
        </div>
      );
    return (
      <div>
        <ToastContainer />
        {!loading ?
          <div>
            {
              removePopup.visible &&
              this.renderRemovePopup()
            }
            <Prompt
              when={isDirty}
              message={unsavedAlert}
            />
            <div className="content-wrapper area-details-wrapper">
              <h2>{newArea ? headingAdd : headingEdit}</h2>
              {content}
            </div>
            {areaOverview &&
              <div className="bottom-container">
                <button
                  disabled={!isDirty || hasError.length > 0}
                  className="btn green"
                  onClick={() => this.submitArea()}
                >{save}
                </button>
                <button
                  className="btn red ml15"
                  onClick={() => dispatch(push(`${PATH_PREFIX}/${language}/${name}/${URL_TYPES.AREAS}`))}
                >
                  {cancel}
                </button>
              </div>
            }
          </div>
          :
          <LoadingIndicatorComponent />}
      </div>
    );
  }
}
const mapStateToProps = state => ({
  sessionReducer: state.SessionReducer,
  areaReducer: state.AreaReducer,
  areaOverviewReducer: state.AreaOverviewReducer,
  municipalityReducer: state.MunicipalityReducer,
  languageReducer: state.LanguageReducer,
  toggleReducer: state.ToggleReducer,
});
export default connect(mapStateToProps)(AreaDetailsComponent);
