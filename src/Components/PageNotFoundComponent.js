/* eslint-env browser */

import React, { Component } from 'react';
import { connect } from 'react-redux';

class PageNotFoundComponent extends Component {
  render() {
    const {
      languageReducer: {
        applicationText: {
          general: {
            noPageHeaderSv, noPageHeaderEn, noPageMessageSv, noPageMessageEn,
          },
        },
      },
    } = this.props;

    return (
      <div>
        <div className="no-page-wrapper" >
          <div className="sv-error-wrapper" >
            <h2>{noPageHeaderSv}</h2>
            {noPageMessageSv}
          </div>

          <div className="en-error-wrapper" >
            <h3>{noPageHeaderEn}</h3>
            {noPageMessageEn}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  municipalityReducer: state.MunicipalityReducer,
  languageReducer: state.LanguageReducer,
  sessionReducer: state.SessionReducer,
  toggleReducer: state.ToggleReducer,
});

export default connect(mapStateToProps)(PageNotFoundComponent);
