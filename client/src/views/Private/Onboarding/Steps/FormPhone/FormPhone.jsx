import React from 'react';
import css from '../Forms.module.css';
import { Emoji, LoadingSubmit } from '../../../../../components/export';
import { toast } from 'react-toastify';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default class FormPhone extends React.Component {
  state = {
    isLoading: false
  };

  submitPhone = e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    const checkNum = parsePhoneNumberFromString(this.props.phone, 'US');
    if (!checkNum || checkNum.country !== 'US' || !checkNum.isValid()) {
      this.setState({ isLoading: false });
      return toast.error('Phone number is invalid. Please try again.');
    }
    fetch('/user/onboarding/phone-input', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: checkNum.number })
    })
      .then(res => {
        if (res.ok) {
          return this.props.goForward();
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

  render() {
    const { submitPhone } = this;
    const { handleChange, phone } = this.props;
    const { isLoading } = this.state;
    const { inputField, form } = css;
    return (
      <div className="text-center">
        <h1 className="text-center m-3">
          Verify Your Phone Number{' '}
          <Emoji value="☎️" ariaLabel="Telephone Emoji" role="img" />
        </h1>
        <h5>You should receive a text message to this number</h5>
        <p className="font-italic">Text message and data rates may apply</p>
        <div className="mt-5">
          <form className={form} onSubmit={submitPhone}>
            <p>We're only available in the U.S. (for now!)</p>
            <p>Please enter your 10-digit phone number</p>
            <div style={{ maxWidth: '15rem' }} className="mx-auto">
              <input
                type="tel"
                name="phone"
                maxLength="10"
                placeholder="Ex: 4151234567"
                className={inputField}
                style={{ maxWidth: '15rem' }}
                value={phone}
                title="Ex: 4151234567"
                onChange={handleChange}
                required
              />
            </div>
            <LoadingSubmit
              text="Submit"
              loadingText="Loading..."
              className="btn btn-primary"
              isLoading={isLoading}
            />
          </form>
        </div>
      </div>
    );
  }
}
