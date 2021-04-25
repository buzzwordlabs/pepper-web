import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { Redirect } from 'react-router-dom';
import { redirectOnboarding } from '../../../../hoc/export';
import { GlobalContext } from '../../../../global/GlobalContext';
class Unsubscribe extends Component {
  static contextType = GlobalContext;

  state = {
    renderConfirmation: false,
    isLoading: false,
    redirectToSettings: false
  };

  firstClick = () => {
    this.setState({ renderConfirmation: true });
  };

  submit = e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    fetch('/user/payment/cancel', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (res.ok) {
          toast.success('You have been successfully unsubscribed.');
          toast.success(
            'If you ever want to resubscribe, you can always change your payment settings!'
          );
          return this.setState({ redirectToSettings: true });
        }
        throw new Error(res.status.toString());
      })
      .catch(err => {
        if (err.message === '401') {
          toast.error('Please login to access that page.');
          return this.setState({ redirect: true });
        } else {
          return toast.error('Something went wrong.');
        }
      });
    this.setState({ isLoading: false });
  };

  render() {
    const { renderConfirmation, isLoading, redirectToSettings } = this.state;
    const { firstClick, submit } = this;
    const { onboardingStep } = this.context.state;
    if (onboardingStep !== 0) return <Redirect to="/user/onboarding" />;
    if (redirectToSettings) return <Redirect to="/user/settings" />;
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-12 text-center">
            <h1 className="my-5">Unsubscribe From Pepper</h1>
            <p>
              After unsubscribing, be sure to turn off call forwarding on your
              phone-- you won't receive any calls going to you if call
              forwarding is not deactivated.
            </p>
            {!renderConfirmation ? (
              <button
                className="btn btn-danger mx-auto d-block my-4"
                onClick={firstClick}
              >
                Unsubscribe
              </button>
            ) : (
              <button
                onClick={submit}
                className="btn btn-danger mx-auto d-block my-4"
                disabled={isLoading ? true : false}
              >
                {isLoading ? 'Loading...' : 'Are you sure?'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default redirectOnboarding(Unsubscribe);
