import React, { Component } from 'react';
import { LoadingSubmit, Tier } from '../../../../components/export';
import { toast } from 'react-toastify';
import { Redirect } from 'react-router-dom';
import { redirectOnboarding } from '../../../../hoc/export';
import { GlobalContext } from '../../../../global/GlobalContext';

class PaymentSettings extends Component {
  static contextType = GlobalContext;

  state = {
    currentTier: '',
    newTier: '',
    isCompleted: false,
    isLoading: false,
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

  componentDidMount() {
    fetch('/user/payment/current', {
      method: 'GET'
    })
      .then(res => {
        if (res.ok) return res.json();
        else throw new Error(res.status.toString());
      })
      .then(json => {
        return this.setState({ currentTier: json.currentTier });
      })
      .catch(err => {
        if (err.message === '401') {
          toast.error('Please login to access that page.');
          return this.setState({ redirect: true });
        }
        return toast.error('Something went wrong.');
      });
  }

  changePlan = () => {
    this.setState({ isLoading: true });
    const { newTier } = this.state;
    fetch('/user/payment/change', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newTier: Number(newTier) })
    })
      .then(res => {
        if (res.ok) {
          toast.success('Success! Your payment plan has now been changed.');
          return this.setState({ isCompleted: true });
        }
        throw new Error(res.status.toString());
      })
      .catch(err => {
        if (err.message === '401') {
          toast.error('Please login to access that page.');
          return this.setState({ redirect: true });
        }
        return toast.error('Something went wrong.');
      });
    this.setState({ isLoading: false });
  };

  resubscribe = () => {
    this.setState({ isLoading: true });
    const { newTier } = this.state;
    fetch('/user/payment/resubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newTier: Number(newTier) })
    })
      .then(res => {
        if (res.ok) {
          toast.success('Success! Your payment plan has now been changed.');
          return this.setState({ isCompleted: true });
        }
        throw new Error(res.status.toString());
      })
      .catch(err => {
        if (err.message === '401') {
          toast.error('Please login to access that page.');
          return this.setState({ redirect: true });
        }
        return toast.error('Something went wrong.');
      });
    this.setState({ isLoading: false });
  };

  submit = e => {
    e.preventDefault();
    const { currentTier } = this.state;
    if (currentTier > -1) {
      return this.changePlan();
    }
    return this.resubscribe();
  };

  onChange = e => {
    this.setState({
      newTier: e.target.value
    });
  };

  render() {
    const {
      redirect,
      isCompleted,
      isLoading,
      tiers,
      currentTier,
      newTier
    } = this.state;
    const { onboardingStep } = this.context.state;
    const tier = currentTier !== -1 ? tiers[currentTier] : null;
    if (onboardingStep !== 0) return <Redirect to="/user/onboarding" />;
    if (redirect) return <Redirect to="/login" />;
    if (isCompleted) return <Redirect to="/user/settings" />;
    return (
      <div className="container" style={{ minHeight: '100%' }}>
        <div className="row">
          <div className="col-12 col-md-6 offset-md-3">
            <h1 className="text-center my-5">Payment Settings</h1>
            {tier ? (
              <>
                <h3 className="my-1 text-center d-block">
                  Your current subscription:
                </h3>
                <Tier
                  minutes={tier.minutes}
                  details={tier.details}
                  smallDetails={tier.smallDetails}
                  flatPrice={tier.flatPrice}
                  name={tier.name}
                  numFlames={tier.numFlames}
                  button={false}
                />
              </>
            ) : (
              <h3 className="text-center mb-4">
                You currently aren't subscribed to a plan.
              </h3>
            )}
            <div className="row">
              <form
                onSubmit={this.submit}
                className="mx-auto d-block text-center"
              >
                <h4 className="mb-3">
                  To change your subscription, pick from one of the plans below.
                </h4>
                <select
                  name="newTier"
                  onChange={this.onChange}
                  className="d-block mx-auto"
                  defaultValue=""
                >
                  <option>Choose a plan</option>
                  {tiers.map((tier, key) => {
                    if (key === currentTier) return null;
                    return (
                      <option value={key} key={key}>
                        {tier.name}: {tier.flatPrice}/mo for {tier.minutes}
                      </option>
                    );
                  })}
                </select>
                <LoadingSubmit
                  loadingValue="Loading..."
                  isLoading={isLoading}
                  className="btn btn-primary d-block my-4 mx-auto"
                  disabled={!['0', '1', '2', '3'].includes(newTier)}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default redirectOnboarding(PaymentSettings);
