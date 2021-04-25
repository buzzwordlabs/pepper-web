import React, { Component } from 'react';
import css from '../Forms.module.css';
import { Emoji, LoadingSubmit } from '../../../../../components/export';
import { toast } from 'react-toastify';

export default class FormSIP extends Component {
  state = {
    isLoading: false
  };

  submitSIPCreation = e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    const onboardingStep = this.props.onboardingStep;
    fetch('/user/onboarding/create-sip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.props.username,
        password: this.props.password,
        onboardingStep: onboardingStep
      })
    })
      .then(res => {
        if (res.ok) return res.json();
        if (res.status === 409) return res.json();
        throw new Error(res.status.toString());
      })
      .then(json => {
        if (json.token) {
          localStorage.setItem('token', json.token);
          return this.props.goForward();
        } else {
          return toast.error(json.errorMessage);
        }
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

  render() {
    const renderButtons = () => {
      return this.props.hasSIP === null ? (
        <>
          <h5 className="m-5">Do you have an SIP account?</h5>
          <div className="m-5">
            <button
              className="btn btn-primary m-1"
              onClick={this.props.changeHasSIP}
            >
              Yes
            </button>
            <button
              className="btn btn-danger m-1"
              onClick={this.props.changeNoSIP}
            >
              No
            </button>
            <button
              className="btn btn-success m-1"
              onClick={this.props.changeNoSIP}
            >
              Not Sure
            </button>
          </div>
        </>
      ) : null;
    };

    const renderForms = () => {
      return (
        <form className={css.form} onSubmit={this.submitSIPCreation}>
          <p>
            In order to use Pepper, you need something called an "SIP account"
            to take calls.
          </p>
          <br />
          <p>
            We'll generate one for you, and you should receive an email to
            verify yourself!
          </p>

          <label className="text-left d-block">Username:</label>
          <p className="text-left" style={{ color: '#4192f2' }}>
            Choose wisely! Your username cannot be changed. <br />
            It can include lowercase letters, numbers, periods, hyphens, and
            underscores. <br />
            It has to be at least 3 characters long.
          </p>
          <input
            type="text"
            name="username"
            maxLength="64"
            minLength="3"
            title="Minimum length is 3 characters, maximum 64 characters."
            className={css.inputField}
            placeholder="Username"
            value={this.props.username}
            onChange={this.props.handleChange}
            required
          />
          <label className="text-left d-block">Password:</label>
          <input
            type="password"
            name="password"
            maxLength="34"
            minLength="1"
            title="Minimum 1 character, maximum 34 characters."
            className={css.inputField}
            placeholder="Password"
            value={this.props.password}
            onChange={this.props.handleChange}
            required
          />
          <p className="text-danger text-left">
            Make sure to keep your username <strong>and</strong> password
            secret!
          </p>
          <LoadingSubmit
            text="Create Account"
            loadingText="Loading..."
            className="btn btn-primary my-3"
            isLoading={this.state.isLoading}
          />
        </form>
      );
    };

    return (
      <div className="text-center">
        <h1 className="m-3">
          SIP Account Setup
          <Emoji value="📶" />
        </h1>
        {renderButtons()}
        {renderForms()}
      </div>
    );
  }
}
