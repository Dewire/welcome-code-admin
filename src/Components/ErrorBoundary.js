import { Component } from 'react';
import ReactGA from 'react-ga';
import { putErrorMessage } from '../Utils/fetcherUtil';
import { CONF_NAME } from '../Constants';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    // Split componentStack string in to an array where each value
    // represent a row in componentStack
    const componentStack = info.componentStack.split('in');
    let label = '';
    // Take the first three rows from componentStack and add them to label for GA
    for (let i = 0; i < componentStack.length && i < 3; i += 1) {
      const errorInfo = componentStack[i].trim();
      if (errorInfo.length > 0) {
        label += errorInfo;
      }
    }

    ReactGA.event({
      category: 'ERROR',
      action: 'ErrorBoundary Admin',
      label,
      nonInteraction: true,
    });

    const errorMessage = {
      errorOrigin: `Admin${CONF_NAME}`,
      label: `Stack trace ${info.componentStack}`,
    };

    putErrorMessage(errorMessage)
      .catch((er) => {
        console.log('error', er);
      });
  }

  render() {
    if (this.state.hasError) {
      return this.props.children;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
