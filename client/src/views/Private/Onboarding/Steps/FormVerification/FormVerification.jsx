import React from 'react';
import css from '../Forms.module.css';
import { Emoji, LoadingSubmit } from '../../../../../components/export';
import css2 from './FormVerification.module.css';
import { toast } from 'react-toastify';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default class FormVerification extends React.Component {
  state = {
    canResend: false,
    isLoading: false
  };

  submitVerification = e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    const { code, onboardingStep, phone } = this.props;
    const checkNum = parsePhoneNumberFromString(phone, 'US');
    if (!checkNum || checkNum.country !== 'US' || !checkNum.isValid()) {
      this.setState({ isLoading: false });
      return toast.error(
        'Phone number is invalid. Please go back and try again.'
      );
    }
    fetch('/user/onboarding/phone-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        phone: checkNum.number,
        code,
        onboardingStep
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error(res.status.toString());
      })
      .then(json => {
        localStorage.setItem('token', json.token);
        toast.success('Success! Your verification number was correct.');
        return this.props.goForward();
      })
      .catch(err => {
        if (err.message === '401') {
          toast.error('Please login to access that page.');
          return this.setState({ redirect: true });
        }
        if (err.message === '409') {
          return toast.error(
            'This number is already active. Please login with the account that has this phone number.'
          );
        }
        return toast.error('Something went wrong.');
      });
    this.setState({ isLoading: false });
  };

  render() {
    return (
      <div className="text-center">
        <h1 className="m-3">
          Your Verification Number <Emoji value="🔢" />
        </h1>
        <h5 className="m-3">
          You should get a 6-digit text message soon to{' '}
          <span style={{ color: '#4192f2' }}>{this.props.phone}</span>.
        </h5>
        <form onSubmit={this.submitVerification} className={css.form}>
          <input
            type="text"
            placeholder="Ex: 123456"
            name="code"
            onChange={this.props.handleChange}
            maxLength="6"
            pattern="[0-9]{6}"
            title="Ex: 123456"
            className={css.inputField}
            required
          />
          <LoadingSubmit
            text="Verify"
            loadingText="Loading..."
            className="btn btn-primary"
            isLoading={this.state.isLoading}
          />
          <p onClick={this.props.goBack} className={`mt-3 ${css2.linkHover}`}>
            Entered the wrong phone number or didn't receive a text?
          </p>
        </form>
      </div>
    );
  }
}
