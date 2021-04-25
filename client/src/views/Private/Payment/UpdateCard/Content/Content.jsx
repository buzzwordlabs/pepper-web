import React, { Component } from 'react';
import { injectStripe } from 'react-stripe-elements';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement
} from 'react-stripe-elements';
import { LoadingSubmit } from '../../../../../components/export';
import { toast } from 'react-toastify';
import { Redirect } from 'react-router-dom';
import css from './Content.module.css';

class Content extends Component {
  state = {
    isLoading: false,
    name: '',
    redirectToLogin: false,
    redirectToSettings: false
  };

  submitPayment = e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    this.props.stripe
      .createToken({
        type: 'card',
        name: this.state.name
      })
      .then(({ token }) => {
        fetch('/user/payment/update-card', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stripeToken: token.id })
        })
          .then(res => {
            if (res.ok) {
              toast.success('Success! Your card information has been updated.');
              return this.setState({ redirectToSettings: true });
            }
            throw new Error(res.status.toString());
          })
          .catch(err => {
            if (err.message === '401') {
              toast.error('Please login to access that page.');
              return this.setState({ redirectToLogin: true });
            }
            return toast.error('Something went wrong.');
          });
      });
    this.setState({ isLoading: false });
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

  render() {
    if (this.state.redirectToLogin) return <Redirect to="/login" />;
    if (this.state.redirectToSettings) return <Redirect to="/user/settings" />;
    return (
      <>
        <h1 className="text-center my-5">Update Payment Method</h1>
        <form onSubmit={this.submitPayment} className={`${css.form} mb-5`}>
          <label>Name on Card</label>
          <input
            type="text"
            minLength="1"
            onChange={this.handleChange}
            name="name"
            className={`${css.stripeInput} ${css.shadow}`}
            placeholder="John Doe"
          />
          <label>Card Number</label>
          <CardNumberElement className={`${css.stripeInput} ${css.shadow}`} />
          <label>Expiration Date</label>
          <CardExpiryElement className={`${css.stripeInput} ${css.shadow}`} />
          <label>CVC</label>
          <CardCVCElement className={`${css.stripeInput} ${css.shadow}`} />
          <LoadingSubmit
            text="Make Payment"
            loadingText="Loading..."
            className="btn btn-primary"
            isLoading={this.state.isLoading}
          />
        </form>
      </>
    );
  }
}

export default injectStripe(Content);
