/* eslint-env browser */
import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import { unregister } from './registerServiceWorker';

render(
  <App />,
  document.getElementById('root'),
);
unregister();
