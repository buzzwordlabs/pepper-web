import React, { Component } from 'react';
import {
  Greeting,
  FormPhone,
  FormVerification,
  FormSIP,
  AppDownload,
  Payment
} from './Steps/export';
import { Redirect } from 'react-router-dom';
import { GlobalContext } from '../../../global/GlobalContext';
import { StripeProvider, Elements } from 'react-stripe-elements';
import Pricing from './Steps/Pricing/Pricing';
import { toast } from 'react-toastify';

export default class Onboarding extends Component {
  static contextType = GlobalContext;
  state = {
    // Keeps track of the user's progress in onboarding process
    onboardingStep: this.context.state.onboardingStep,
    // Phone number for <FormPhone/> and <FormSIP/>
    phone: '',
    // Verification number from text message <FormVerification/>
    code: '',
    // For <FormSIP/>
    username: '',
    // For <FormSIP/>
    password: '',
    tierNum: '',
    redirect: false,
    tiers: [
      {
        name: 'Bell Pepper',
        flatPrice: '$2',
        minutes: '50 minutes/mo',
        details: 'on incoming calls',
        smallDetails: '$0.04/min after 50 minutes',
        numFlames: 1
      },
      {
        name: 'Black Pepper',
        flatPrice: '$7 ',
        minutes: '200 minutes/mo',
        details: 'on incoming calls',
        smallDetails: '$0.04/min after 200 minutes',
        numFlames: 2
      },
      {
        name: 'Chili Pepper',
        flatPrice: '$14',
        minutes: '400 minutes/mo',
        details: 'on incoming calls',
        smallDetails: '$0.04/min after 400 minutes',
        numFlames: 3
      },
      {
        name: 'Ghost Pepper',
        flatPrice: '$0.04/min',
        minutes: 'Unlimited',
        details: 'on incoming calls',
        numFlames: 4
      }
    ]
  };

  goBack = () => {
    this.setState(prevState => ({
      onboardingStep: prevState.onboardingStep - 1
    }));
    this.context.changeOnboardingStep(this.state.onboardingStep);
  };

  goForward = () => {
    this.setState(prevState => ({
      onboardingStep: prevState.onboardingStep + 1
    }));
    this.context.changeOnboardingStep(this.state.onboardingStep);
  };

  completeOnboarding = () => {
    fetch('/user/onboarding/complete', {
      method: 'POST'
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error(res.status.toString());
      })
      .then(json => {
        localStorage.setItem('token', json.token);
        this.context.changeOnboardingStep(0);
        return this.setState({
          onboardingStep: 0
        });
      })
      .catch(err => {
        if (err.message === '401') {
          toast.error('Please login to access that page.');
          return this.setState({ redirect: true });
        }
        return toast.error('Something went wrong.');
      });
  };

  handleChange = e => {
    // Store the name of the property being changed
    let name = e.target.name;
    // Store the value the property will change to (the current input)
    let value = e.target.value;
    this.setState({
      // Update only the property that should be changed
      [name]: value
    });
  };

  selectTier = e => {
    const tierNum = e.target.value;
    this.setState(
      {
        tierNum
      },
      () => {
        this.goForward();
      }
    );
  };

  render() {
    const {
      onboardingStep,
      phone,
      code,
      username,
      password,
      tierNum,
      tiers
    } = this.state;

    const {
      goBack,
      goForward,
      handleChange,
      selectTier,
      completeOnboarding
    } = this;

    const renderSteps = () => {
      switch (onboardingStep) {
        case 1:
          return <Greeting goForward={goForward} />;
        // Asks about phone number send verification code
        case 2:
          return (
            <FormPhone
              goForward={goForward}
              goBack={goBack}
              phone={phone}
              handleChange={handleChange}
              onboardingStep={onboardingStep}
            />
          );
        // Takes verification code as input and checks if valid
        case 3:
          return (
            <FormVerification
              goForward={goForward}
              goBack={goBack}
              code={code}
              handleChange={handleChange}
              phone={phone}
              onboardingStep={onboardingStep}
            />
          );
        // Gets user's SIP account information and generates an account if needed
        case 4:
          return (
            <FormSIP
              goForward={goForward}
              username={username}
              password={password}
              handleChange={handleChange}
              onboardingStep={onboardingStep}
            />
          );
        case 5:
          return (
            <Pricing
              goForward={goForward}
              onboardingStep={onboardingStep}
              selectTier={selectTier}
              tiers={tiers}
              tierNum={tierNum}
            />
          );
        // Payment Page
        case 6:
          return (
            <StripeProvider
              apiKey={
                process.env.NODE_ENV !== 'production'
                  ? process.env.REACT_APP_STRIPE_TEST_PUBLISHABLE_KEY
                  : process.env.REACT_APP_STRIPE_LIVE_PUBLISHABLE_KEY
              }
            >
              <Elements>
                <Payment
                  onboardingStep={onboardingStep}
                  goForward={goForward}
                  goBack={goBack}
                  handleChange={handleChange}
                  tierNum={tierNum}
                />
              </Elements>
            </StripeProvider>
          );
        // Tells user to download the LinPhone SIP dialer app
        case 7:
          return (
            <AppDownload
              onboardingStep={onboardingStep}
              completeOnboarding={completeOnboarding}
            />
          );
        case 0:
          return <Redirect to="/user/settings" />;
        default:
          return <Redirect to="/" />;
      }
    };
    if (this.state.redirect) return <Redirect to="static/login" />;
    return (
      <div className="container" style={{ minHeight: '80vh' }}>
        <div className="row">
          <div className="col-12 col-md-10 offset-md-1">
            <Progress onboardingStep={onboardingStep} />
            {renderSteps()}
          </div>
        </div>
      </div>
    );
  }
}

const Progress = props => {
  return <h6 className="text-center mt-4">Step {props.onboardingStep} of 7</h6>;
};
