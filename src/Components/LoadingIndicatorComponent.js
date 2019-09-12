import React, { Component } from 'react';

class LoadingIndicatorComponent extends Component {
  render() {
    return (
      <div>
        <div className="loading-indicator">
          <div className="sk-folding-cube">
            <div className="sk-cube1 sk-cube" />
            <div className="sk-cube2 sk-cube" />
            <div className="sk-cube4 sk-cube" />
            <div className="sk-cube3 sk-cube" />
          </div>
        </div>
      </div>
    );
  }
}

export default LoadingIndicatorComponent;
