/* eslint-env browser */
/* eslint no-underscore-dangle: ["error", { "allow": ["_icon"] }] */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Leaflet from 'leaflet';
import classNames from 'classnames';
import 'leaflet.markercluster';
import 'leaflet-edgebuffer';
import AreaCardComponent from './AreaCardComponent';
import { URL_TYPES } from '../Constants';
import mapPinLocation from '../Images/Icons/icon_map_pin_your_location.svg';

class MapViewComponent extends Component {
  constructor() {
    super();
    this.state = {
      openArea: {},
      editing: false,
    };
  }

  componentDidMount() {
    this.createMap();
    this.addMapLayer();
    this.addAreaMarkers();
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.openArea && prevProps.openArea !== this.props.openArea)) {
      if (this.props.openArea.coordinates.lat && this.props.openArea.coordinates.long) {
        this.redrawPopup();
      }
    }

    if ((prevProps.MapViewReducer.filteredAreas !==
      this.props.MapViewReducer.filteredAreas)) {
      this.removePopup();
      this.addAreaMarkers();
    }
  }

  setExternalMapState() {
    this.props.onMapStateChange(
      this.map.getCenter(),
      this.map.getZoom(),
    );
  }

  createMap() {
    const {
      MapViewReducer: { center, zoom, commuteDestination },
      newArea,
      openArea,
      mapStateComponent,
    } = this.props;

    this.map = Leaflet.map('map', {
      attributionControl: false,
      zoomControl: false,
    }).setView([center.lat, center.long], zoom);

    this.map.dragging.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();

    if (openArea) { this.openPopup(); }
    if (mapStateComponent) { this.addStartPin(commuteDestination); }
    if (newArea) { this.toggleEditing(center); }
  }

  addMapLayer() {
    const { mapCredentials } = this.props.MunicipalityReducer;


    if (mapCredentials) {
      this.defaultMapLayer =
          Leaflet.tileLayer.wms(`${process.env.REACT_APP_MAP_PROXY_URL}/api/lantmateriet`, {
            api: 'topowebb-skikt/wms/v1.1',
            layers: 'mark,hydrografi_ytor,bebyggelse_nedtonad,jarnvag_nedtonad,kommunikation_nedtonad,text_nedtonad',
            format: 'image/png',
            srs: 'EPSG:3857',
            mapCredentials: JSON.stringify(mapCredentials),
          });
    } else {
      const osmWLabels =
      Leaflet.tileLayer.wms('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
        maxZoom: 12,
        attribution:
        '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia maps</a> | Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      });

      const osmWOLabels =
      Leaflet.tileLayer.wms('https://maps.wikimedia.org/osm/{z}/{x}/{y}.png', {
        minZoom: 13,
        attribution:
        '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia maps</a> | Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      });

      this.defaultMapLayer = new Leaflet.LayerGroup([osmWLabels, osmWOLabels]);
    }

    this.map.addLayer(this.defaultMapLayer);
  }

  removeStartPin() {
    this.map.removeLayer(this.startPin);
  }

  moveStartPin(e) {
    const { editing } = this.state;

    if (editing) {
      this.startPin.setLatLng(e.latlng);
      this.props.onAreaCoordinatesChange(e.latlng);
    }
  }

  addStartPin(destination) {
    const startPin = Leaflet.icon({
      iconUrl: mapPinLocation,
      iconAnchor: [13, 34],
    });

    this.startPin = Leaflet.marker(
      [destination.lat, destination.long],
      { icon: startPin },
    ).addTo(this.map);
  }

  addAreaMarkers() {
    const {
      MapViewReducer: { filteredAreas },
      openArea,
      mapStateComponent,
    } = this.props;

    let {
      AreaReducer: { areas },
    } = this.props;

    if (this.clusteredMarkers) {
      this.map.removeLayer(this.clusteredMarkers);
    }

    this.clusteredMarkers = Leaflet.markerClusterGroup({
      showCoverageOnHover: false,
      removeOutsideVisibleBounds: false,
      zoomToBoundsOnClick: false,
      iconCreateFunction: (cluster) => {
        const hasFav = cluster.getAllChildMarkers().some(m => m.options.isFav);
        return Leaflet.divIcon({
          className: 'map-pin-multiple-wrapper',
          html: `<div class="icon-pin ${hasFav ? 'fav' : ''}"><p><b>${cluster.getChildCount()}</b> st</p></div>`,
          iconAnchor: [-22, 50],
          iconSize: [0, 0],
        });
      },
    });

    if (filteredAreas) {
      areas = areas.filter(a => filteredAreas.indexOf(a.areaId) > -1);
    }

    areas.forEach((a) => {
      const iconClasses = classNames('map-pin-area green-theme');
      const iconHtmlClasses = classNames('icon-pin icon-green');
      const nameHtmlClasses = classNames('area-name');
      const areaIcon = Leaflet.divIcon({
        areaId: a.areaId,
        className: iconClasses,
        html: `<div class="${iconHtmlClasses}"></div><div class="${nameHtmlClasses}"><p>${a.name}</p></div>`,
        iconAnchor: [13, 34],
        iconSize: [0, 0],
      });

      if (mapStateComponent || a.areaId !== openArea.areaId) {
        const areaMarker = Leaflet
          .marker([a.coordinates.lat, a.coordinates.long], { icon: areaIcon });
        this.clusteredMarkers.addLayer(areaMarker);
      }
    });

    this.map.addLayer(this.clusteredMarkers);
  }

  redrawPopup() {
    const { openArea, editing } = this.state;
    const { AreaReducer: { areas } } = this.props;
    const updatedArea = areas.find(a => a.areaId === openArea.areaId);

    if (!editing) {
      this.removePopup();
      this.openPopup(updatedArea);
    }
  }

  removePopup() {
    if (document.getElementById('popup')) {
      document.getElementById('popup').outerHTML = '';
      if (document.getElementsByClassName('selected-map-marker')[0]) {
        document.getElementsByClassName('selected-map-marker')[0].className =
        document.getElementsByClassName('selected-map-marker')[0].className.replace('selected-map-marker', '');
        this.setState({ openArea: {} });
      }
    }
  }

  openPopup() {
    this.removePopup();
    const popupIcon = Leaflet.divIcon({
      className: 'popup',
      html: '<div id="popup"></div>',
      iconSize: [0, 0],
      iconAnchor: [122, 288],
    });

    const {
      LanguageReducer,
      MunicipalityReducer,
      MapViewReducer,
      dispatch,
      AreaReducer,
      openArea,
    } = this.props;

    const {
      name,
      areaId,
      thumbnail,
      coordinates,
      commute,
      avgPrice,
      isFav,
    } = openArea;

    const areaCard = (<AreaCardComponent
      LanguageReducer={LanguageReducer}
      MunicipalityReducer={MunicipalityReducer}
      MapViewReducer={MapViewReducer}
      AreaReducer={AreaReducer}
      name={name}
      id={areaId}
      thumbnail={thumbnail}
      coordinates={coordinates}
      commute={commute}
      avgPrice={avgPrice}
      isFav={isFav}
      navigationOnClick={() => {
        dispatch(push(`/${LanguageReducer.language}/${MunicipalityReducer.name}/${URL_TYPES.AREA}/${name.toLowerCase()}`));
        this.removePopup();
      }}
    />);

    this.setState({ openArea });

    const currPoint =
      this.map.latLngToContainerPoint(Leaflet.latLng([coordinates.lat, coordinates.long]));
    const newPoint = Leaflet.point(currPoint.x + 20, currPoint.y - 120);

    this.map.panTo(this.map.containerPointToLatLng(newPoint));
    this.popupMarker = Leaflet.marker([coordinates.lat, coordinates.long], { icon: popupIcon });
    this.map.addLayer(this.popupMarker);

    ReactDOM.render(areaCard, document.getElementById('popup'));
  }

  mapZoomIn() {
    this.map.zoomIn();
  }

  mapZoomOut() {
    this.map.zoomOut();
  }

  toggleEditing(coordinates) {
    const { mapStateComponent } = this.props;
    const { editing, openArea } = this.state;
    this.setState({ editing: !editing });

    if (!editing) {
      this.map.dragging.enable();
      this.map.touchZoom.enable();
      this.map.doubleClickZoom.enable();
      this.map.scrollWheelZoom.enable();
      this.map.on('click', e => this.moveStartPin(e));

      if (mapStateComponent) {
        this.map.on('moveend zoomend', () => this.setExternalMapState());
      } else {
        this.removePopup();
        this.addStartPin(coordinates || openArea.coordinates);
      }
    } else {
      this.map.dragging.disable();
      this.map.touchZoom.disable();
      this.map.doubleClickZoom.disable();
      this.map.scrollWheelZoom.disable();
      this.map.off('click', e => this.moveStartPin(e));

      if (mapStateComponent) {
        this.map.off('moveend zoomend', () => this.setExternalMapState());
      } else {
        this.openPopup();
        this.removeStartPin();
      }
    }
  }

  render() {
    const {
      mapStateComponent,
      LanguageReducer: {
        applicationText: {
          areaOverview: {
            changeAreaPos,
            stopChangeAreaPos,
            editingNotice,
          },
          mapState: {
            changeMapPos,
            editingNoticeCommute,
            editingNoticeMapState,
          },
        },
      },
    } = this.props;

    const { editing } = this.state;

    const mapClasses =
      classNames('map-view-container leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom', { 'no-interact': !editing });
    const zoomInClasses = classNames('btn green zoom zoom-in', { hide: !editing });
    const zoomOutClasses = classNames('btn green zoom zoom-out', { hide: !editing });
    const startEditText = mapStateComponent ? changeMapPos : changeAreaPos;
    const editingNoticeMarkup = mapStateComponent ?
      (
        <div className="editing-notice">
          <p>{editingNoticeCommute}</p>
          <p>{editingNoticeMapState}</p>
        </div>
      )
      :
      (
        <div className="editing-notice">
          <p>{editingNotice}</p>
        </div>
      );

    return (
      <div className="map-view-wrapper">
        <div id="map" className={mapClasses} />
        <div className="map-view-button-wrapper">
          {
            editing &&
            editingNoticeMarkup
          }

          <input
            className={zoomInClasses}
            type="button"
            onClick={() => this.mapZoomIn()}
            value="+"
          />
          <input
            className={zoomOutClasses}
            type="button"
            onClick={() => this.mapZoomOut()}
            value="-"
          />
          <button
            className="btn green edit-map-state"
            onClick={() => this.toggleEditing()}
          >
            {editing ? stopChangeAreaPos : startEditText}
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  MunicipalityReducer: state.MunicipalityReducer,
  AreaReducer: state.AreaReducer,
  ToggleReducer: state.ToggleReducer,
  LanguageReducer: state.LanguageReducer,
});

export default connect(mapStateToProps)(MapViewComponent);
