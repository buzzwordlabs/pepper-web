import React from 'react';
import PropTypes from 'prop-types';

export default function LoadingButton(props) {
  const { value, loadingValue, className, isLoading, disabled } = props;
  return isLoading ? (
    <input className={className} type="submit" value={loadingValue} disabled />
  ) : (
    <input
      className={className}
      type="submit"
      value={value}
      disabled={disabled}
    />
  );
}

LoadingButton.propTypes = {
  value: PropTypes.string,
  loadingValue: PropTypes.string,
  className: PropTypes.string,
  isLoading: PropTypes.bool.isRequired
};

LoadingButton.defaultProps = {
  value: 'Submit',
  loadingValue: 'Loading...'
};
