/* eslint-env browser */
import React, { Component } from 'react';
import classNames from 'classnames';

const placeholderImage = require('../Images/Placeholders/villaomr.png');
const houseImg = require('../Images/Icons/icon_house.svg');
const carImage = require('../Images/Icons/icon_car.svg');
const bicycleImage = require('../Images/Icons/icon_bicycle.svg');
const arrowRightImage = require('../Images/Icons/icon_arrow_right.svg');

class AreaCardComponent extends Component {
  render() {
    const {
      name,
      thumbnail,
      LanguageReducer: { applicationText: { areaOverview: { areaCardSave } } },
    } = this.props;
    return (
      <div className="area-card-container">
        <div className="wrapper">
          <div className="row collapse main-dividers top" style={{ backgroundImage: `url(${thumbnail || placeholderImage})` }}>
            <div className="close-container">
              <button className="btn close-circle" id="close-btn" />
            </div>
            <button className="navigation-button">
              <div className="row collapse name-container">
                <p>{name}</p>
                <img className="arrow" src={arrowRightImage} alt="arrow" />
              </div>
            </button>
          </div>
          <div className="row collapse main-dividers bottom">
            <div className="row collapse">
              <div className="link-container">
                <input
                  id="fav-btn"
                  type="button"
                  className={classNames('blue-link underline heart-icon')}
                  value={areaCardSave}
                />
              </div>
            </div>
            <div className="row collapse mlr10">
              <div className="columns small-4 medium-12 icon-container">
                <img src={houseImg} alt="coin-stack" />
              </div>
              <div className="columns small-4 medium-12 icon-container">
                <img src={carImage} alt="car" />
              </div>
              <div className="columns small-4 medium-12 icon-container">
                <img src={bicycleImage} alt="bicycle" />
              </div>
            </div>
            <div className="row collapse mlr10 text-row">
              <div className="columns small-4 medium-12 text-container">
                <p>Ca -/m²</p>
              </div>
              <div className="columns small-4 medium-12 text-container">
                <p>- min</p>
              </div>
              <div className="columns small-4 medium-12 text-container">
                <p>- min</p>
              </div>
            </div>
            <div className="marker-container hide-for-small-only" />
          </div>
        </div>
      </div>
    );
  }
}

export default AreaCardComponent;
