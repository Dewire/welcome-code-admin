import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

class InputWithLabel extends Component {
  constructor() {
    super();

    this.state = {
      hasError: false,
      errorText: null,
    };
  }

  setError(hasError, errorText) {
    const {
      toggleError,
      id,
    } = this.props;
    this.setState({ hasError, errorText });
    toggleError(id, hasError);
  }

  validate(inputValue, validate) {
    let errorText = null;
    validate.some((v) => {
      errorText = v()(inputValue);
      return errorText;
    });

    if (errorText) {
      this.setError(true, errorText);
    } else {
      this.setError(false);
    }
  }

  render() {
    const {
      id,
      type,
      label,
      checked,
      value,
      onChange,
      iconClass,
      disabled,
      validate,
      maxLength = 1000,
    } = this.props;

    const { hasError, errorText } = this.state;
    return (
      <div>
        <div className={classNames(
      'input-w-label-wrapper',
          {
            swedish: iconClass === 'swedish',
            english: iconClass === 'english',
            error: hasError,
          },
      )}
        >
          <label htmlFor={id}>
            {label}
            <input
              id={id}
              name={id}
              key={id}
              value={value}
              checked={checked}
              type={type}
              disabled={disabled}
              onChange={(e) => {
              onChange(e);
              if (validate) {
                this.validate(e.target.value, validate);
              }
            }}
              ref={(input) => { this[id] = input; }}
              maxLength={maxLength}
            />
          </label>
        </div>
        {
          hasError &&
          <p className="error-text">{errorText}</p>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  languageReducer: state.LanguageReducer,
});

export default connect(mapStateToProps)(InputWithLabel);
