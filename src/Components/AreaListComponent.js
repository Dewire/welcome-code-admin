import React, { Component } from 'react';
import { connect } from 'react-redux';

class AreaListComponent extends Component {
  constructor() {
    super();

    this.state = {
      query: '',
      filteredAreas: undefined,
    };
  }

  filterAreas(e) {
    const { areaReducer: { areas } } = this.props;
    const query = e.target.value;
    if (query) {
      this.setState({
        query,
        filteredAreas: areas.filter(a => a.name.startsWith(query.toLowerCase())),
      });
    } else {
      this.clearSearch();
    }
  }

  clearSearch() {
    this.setState({
      query: '',
      filteredAreas: undefined,
    });
  }

  render() {
    const {
      areaReducer: { areas },
      areaOnClick,
    } = this.props;

    const { query, filteredAreas } = this.state;
    const activeAreas = filteredAreas || areas;

    const areaList = activeAreas &&
      activeAreas.sort((a, b) => a.name.localeCompare(b.name, 'sv')).map(a => (
        <button
          key={a.name}
          onClick={() => {
         areaOnClick(a);
       }}
        >
          <div className="row">
            <p>{a.name}</p>
          </div>
        </button>
      ));

    return (
      <div className="areas-table-wrapper">
        <div className="text-input-wrapper">
          <input
            id="search-box"
            className="text-input search"
            type="text"
            value={query}
            onChange={e => this.filterAreas(e)}
          />
          {query &&
          <button
            className="btn clear-search-icon search-placeholder-padding"
            onClick={() => this.clearSearch()}
          />}
          <div className="search-icon" />
        </div>
        <div className="areas-table mt25">
          {areaList}
        </div>
      </div>
    );
  }
}
const mapStateToProps = state => ({
  areaReducer: state.AreaReducer,
  municipalityReducer: state.MunicipalityReducer,
  languageReducer: state.LanguageReducer,
  sessionReducer: state.SessionReducer,
});
export default connect(mapStateToProps)(AreaListComponent);
