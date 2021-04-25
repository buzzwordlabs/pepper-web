import React from 'react';
import { StripeProvider, Elements } from 'react-stripe-elements';
import Content from './Content/Content';
import { redirectOnboarding } from '../../../../hoc/export';
import { GlobalContext } from '../../../../global/GlobalContext';
import { Redirect } from 'react-router-dom';

function UpdateCard() {
  const { onboardingStep } = React.useContext(GlobalContext).state;
  if (onboardingStep !== 0) return <Redirect to="/user/onboarding" />;
  return (
    <StripeProvider
      apiKey={
        process.env.NODE_ENV !== 'production'
          ? process.env.REACT_APP_STRIPE_TEST_PUBLISHABLE_KEY
          : process.env.REACT_APP_STRIPE_LIVE_PUBLISHABLE_KEY
      }
    >
      <Elements>
        <Content />
      </Elements>
    </StripeProvider>
  );
}

export default redirectOnboarding(UpdateCard);
