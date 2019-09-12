import { applyMiddleware, compose, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import reducers from './Reducers';

export const history = createHistory();
const browserHistory = routerMiddleware(history);

const enhancer = process.env.NODE_ENV === 'development'
  ? composeWithDevTools(applyMiddleware(thunk, browserHistory, createLogger()))
  : compose(applyMiddleware(thunk, browserHistory));

export const store = createStore(reducers, enhancer);
