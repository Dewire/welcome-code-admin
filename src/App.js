import 'babel-polyfill';
import React, { Component } from 'react';
import { ConnectedRouter } from 'react-router-redux';
import { Provider } from 'react-redux';
import { store, history } from './Store';
import './Style/App.scss';
import Routes from './Routes';
import NavigationComponent from './Components/NavigationComponent';
import ErrorBoundary from './Components/ErrorBoundary';

require('what-input');

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div className="root-wrapper">
            <ErrorBoundary>
              <NavigationComponent />
              <div className="right-wrapper">
                <Routes />
              </div>
            </ErrorBoundary>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}

export default App;
