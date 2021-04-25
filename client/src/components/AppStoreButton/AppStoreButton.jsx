import React from 'react';
import PropTypes from 'prop-types';

const imageLinks = {
  ios:
    'https://linkmaker.itunes.apple.com/images/badges/en-us/badge_appstore-lrg.svg',
  android:
    'https://upload.wikimedia.org/wikipedia/commons/c/cd/Get_it_on_Google_play.svg'
};

export default class MobileStoreButton extends React.Component {
  static propTypes = {
    store: PropTypes.oneOf(['ios', 'android']).isRequired,
    url: PropTypes.string.isRequired,
    height: PropTypes.string,
    width: PropTypes.string,
    linkProps: PropTypes.object,
    style: PropTypes.object
  };
  static defaultProps = {
    height: 75,
    width: 255
  };

  render() {
    const { store, url, height, width, linkProps, ...props } = this.props;

    const linkStyles = {
      background: `url(${imageLinks[store]}) no-repeat`,
      backgroundSize: 'contain',
      display: 'inline-block',
      overflow: 'hidden',
      textDecoration: 'none',
      height: '12.5rem',
      width: '12.5rem',
      padding: '5px'
    };

    return (
      <div style={{ height, width, display: 'inline-block' }} {...props}>
        <a
          style={linkStyles}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          {...linkProps}
        >
          &nbsp;
        </a>
      </div>
    );
  }
}
