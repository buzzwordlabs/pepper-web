import React from 'react';
import PropTypes from 'prop-types';

export default function Emoji(props) {
  return (
    <div className={props.containerClassName} style={props.containerStyle}>
      <span
        className={props.className}
        style={props.style}
        role={props.role}
        aria-label={props.ariaLabel}
      >
        {' '}
        {props.value}{' '}
      </span>
    </div>
  );
}

Emoji.propTypes = {
  role: PropTypes.string,
  ariaLabel: PropTypes.string,
  value: PropTypes.string,
  containerClassName: PropTypes.string,
  containerStyle: PropTypes.object
};

Emoji.defaultProps = {
  role: 'img',
  ariaLabel: 'An Emoji',
  value: '🚫'
};
