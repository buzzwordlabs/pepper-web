import React from 'react';
import { Tier } from '../../../../../components/export';

export default function Pricing(props) {
  return (
    <div className="container">
      <div className="row">
        <div className={`col-12 col-md-10 offset-md-1`}>
          <h1 className="text-center my-5">Choose a Plan</h1>
          <p className="text-center">
            You only pay for incoming calls you answer, not on calls you make!
          </p>

          <div className="row">
            {props.tiers.map((tier, key) => {
              const {
                minutes,
                details,
                flatPrice,
                name,
                numFlames,
                smallDetails
              } = tier;
              return (
                <Tier
                  minutes={minutes}
                  details={details}
                  smallDetails={smallDetails}
                  flatPrice={flatPrice}
                  name={name}
                  numFlames={numFlames}
                  selectTier={props.selectTier}
                  key={key}
                  value={key}
                  containerClassName="col-md-6"
                  button
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
