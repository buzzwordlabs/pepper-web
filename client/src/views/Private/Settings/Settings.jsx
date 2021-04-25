import React, { Component } from 'react';
import { Emoji, LoadingSubmit } from '../../../components/export';
import css from '../../Private/Onboarding/Steps/Forms.module.css';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { redirectOnboarding } from '../../../hoc/export';
class Settings extends Component {
  state = {
    originalSettings: {
      email: '',
      phone: '',
      sipUsername: '',
      sipHost: '',
      firstName: '',
      lastName: ''
    },
    changedSettings: {
      email: '',
      phone: '',
      sipUsername: '',
      sipHost: '',
      firstName: '',
      lastName: ''
    },
    isLoading: false,
    redirect: false
  };

  componentDidMount() {
    let originalSettings = this.state.originalSettings;
    fetch('/user/settings/basic', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error(res.status.toString());
      })
      .then(json => {
        originalSettings.email = json.email;
        originalSettings.phone = json.phone;
        originalSettings.sipUsername = json.sipUsername;
        originalSettings.sipHost = json.sipHost;
        originalSettings.firstName = json.firstName;
        originalSettings.lastName = json.lastName;
        return originalSettings;
      })
      .then(originalSettings => {
        return this.setState({
          originalSettings: originalSettings,
          changedSettings: originalSettings
        });
      })
      .catch(err => {
        if (err.message === '401') {
          toast.error('Please login to access that page.');
          return this.setState({ redirect: true });
        }
        return toast.error('Something went wrong.');
      });
    this.setState({ isLoading: false });
  }

  saveSettings = e => {
    e.preventDefault();
    if (this.state.changedSettings === this.state.originalSettings) {
      return this.setState({ isLoading: false });
    }
    this.setState({ isLoading: true });
    fetch('/user/settings/basic', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: this.state.changedSettings.firstName,
        lastName: this.state.changedSettings.lastName
      })
    })
      .then(res => {
        if (res.ok) return toast.success('Success! Settings were changed.');
        throw new Error(res.status.toString());
      })
      .catch(err => {
        if (err.message === '401') {
          toast.error('Please login to access that page.');
          return this.setState({ redirect: true, isLoading: false });
        } else {
          return toast.error('Something went wrong.');
        }
      });
    this.setState({ isLoading: false });
  };

  resetSettings = e => {
    e.preventDefault();
    const originalSettings = this.state.originalSettings;
    this.setState({ changedSettings: originalSettings });
  };

  handleChange = e => {
    // Store the name of the property being changed
    const name = e.target.name;
    // Store the value the property will change to (the current input)
    const value = e.target.value;

    let changedSettings = { ...this.state.changedSettings };

    // Update only the property that should be changed
    changedSettings[name] = value;
    this.setState({ changedSettings });
  };

  render() {
    const {
      email,
      phone,
      sipUsername,
      sipHost,
      firstName,
      lastName
    } = this.state.changedSettings;
    const { saveSettings, resetSettings, handleChange } = this;
    const { isLoading, redirect } = this.state;
    const { inputField, form } = css;
    if (redirect) return <Redirect to="/login" />;
    return (
      <>
        <h1 className="text-center my-5">
          Welcome to Settings
          <Emoji role="img" ariaLabel="Gear Emoji" value="⚙️" />
        </h1>
        <form className={form} onSubmit={saveSettings}>
          <label className="font-weight-bold">First Name:</label>
          <input
            type="text"
            className={inputField}
            name="firstName"
            minLength="1"
            value={firstName}
            onChange={handleChange}
          />

          <label className="font-weight-bold">Last Name:</label>
          <input
            type="text"
            className={inputField}
            name="lastName"
            minLength="1"
            value={lastName}
            onChange={handleChange}
          />

          <label className="font-weight-bold">Email:</label>
          <label className="font-italic" style={{ color: '#4192f2' }}>
            Since you logged in with Google, your email cannot be changed.
          </label>
          <input
            type="text"
            className={inputField}
            name="email"
            value={email}
            onChange={handleChange}
            style={{ color: 'gray' }}
            disabled
          />

          <label className="font-weight-bold">Phone Number:</label>
          <label className="font-italic" style={{ color: '#4192f2' }}>
            For now, your phone number cannot be changed.
          </label>
          <input
            type="text"
            className={inputField}
            name="phone"
            maxLength="12"
            value={phone}
            onChange={handleChange}
            style={{ color: 'gray' }}
            disabled
          />

          <label className="font-weight-bold">
            To change any information related to your SIP account go here:
          </label>
          <a
            className="mb-4 d-block"
            href="https://www.linphone.org/freesip/home"
            style={{ color: 'orange' }}
          >
            https://www.linphone.org/freesip/home
          </a>

          <label className="font-weight-bold">SIP Account Username:</label>
          <label className="font-italic" style={{ color: '#4192f2' }}>
            To change your SIP account username, go to the link above.
          </label>
          <input
            type="text"
            className={inputField}
            name="sipUsername"
            value={sipUsername}
            style={{ color: 'gray' }}
            disabled
          />

          <label className="font-weight-bold">SIP Account Domain/Host:</label>
          <label className="font-italic" style={{ color: '#4192f2' }}>
            For now, the SIP account host cannot be changed.
          </label>
          <input
            type="text"
            className={inputField}
            name="sipHost"
            value={sipHost}
            style={{ color: 'gray' }}
            disabled
          />

          <LoadingSubmit
            text="Change Settings"
            loadingText="Loading..."
            className="btn btn-primary mr-3"
            isLoading={isLoading}
          />
          <button className="btn btn-primary mr-2" onClick={resetSettings}>
            Reset
          </button>
        </form>
      </>
    );
  }
}

export default redirectOnboarding(Settings);
