import React from 'react';
import { Emoji } from '../export';
import css from './Tier.module.css';
import PropTypes from 'prop-types';

export default function Tier(props) {
  const {
    minutes,
    details,
    smallDetails,
    flatPrice,
    name,
    numFlames,
    selectTier,
    button,
    containerClassName,
    value
  } = props;
  return (
    <div className={`${containerClassName} ${css.container}`}>
      <div className={css.card}>
        <div className="text-center">
          <h2>{name}</h2>
          <h2>{renderFlames(numFlames)}</h2>
          <hr />
          <h1>{flatPrice}</h1>
          <h4>{minutes}</h4>
          <p>{details && details}</p>
          <p style={{ fontSize: '0.8rem' }}>{smallDetails && smallDetails}</p>
        </div>
        {button ? (
          <button
            className="btn btn-primary w-100"
            value={value}
            onClick={selectTier}
          >
            Select Plan
          </button>
        ) : null}
      </div>
    </div>
  );
}

Tier.propTypes = {
  name: PropTypes.string.isRequired,
  flatPrice: PropTypes.string.isRequired,
  minutes: PropTypes.string.isRequired,
  details: PropTypes.string.isRequired,
  numFlames: PropTypes.number
};

Tier.defaultProps = {
  name: 'Tier Name',
  flatPrice: '$Tier Price',
  minutes: 'Tier Minutes',
  details: 'Tier Details',
  numFlames: 5
};

const renderFlames = numFlames => {
  let flames = [];
  for (let i = 0; i < numFlames; i++) {
    flames.push(
      <Emoji value="🔥" key={i} containerStyle={{ display: 'inline' }} />
    );
  }
  return flames;
};
