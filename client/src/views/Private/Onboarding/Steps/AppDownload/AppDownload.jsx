import React, { Component } from 'react';
import css from '../Forms.module.css';

export default class AppDownload extends Component {
  state = {
    phoneNum: ''
  };

  componentDidMount() {
    fetch('/user/phone-number', {
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
        this.setState({ phoneNum: json.phoneNum });
      })
      .catch();
  }

  render() {
    return (
      <div className={`text-center ${css.form}`} style={{ maxWidth: '35rem' }}>
        <h1 className="m-3">Download a Dialer</h1>
        <h3>Last step!</h3>
        <h5>
          Download the LinPhone app below and login with the account info you
          created in step 4 (make sure to verify from your email first).
        </h5>
        <div style={{ marginTop: '2rem' }}>
          <a
            href="https://itunes.apple.com/us/app/linphone/id360065638?mt=8"
            style={{ marginLeft: '3px', marginRight: '3px' }}
          >
            <img
              src="https://linkmaker.itunes.apple.com/images/badges/en-us/badge_appstore-lrg.svg"
              alt="App Store Logo"
              style={{ width: '12.5rem' }}
            />
          </a>
          <br />
          <br />
          <a
            href="https://play.google.com/store/apps/details?id=org.linphone"
            style={{ marginLeft: '3px', marginRight: '3px' }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Get_it_on_Google_play.svg"
              alt="App Store Logo"
              style={{ width: '12.5rem' }}
            />
          </a>
          <br />
          <br />

          <div>
            <strong>IMPORTANT:</strong> Please forward your number to{' '}
            <strong>{this.state.phoneNum}</strong>. If you don't know how, click
            "Finish" and then select the "Call Forwarding" tab at the top. Our
            service will NOT work if you miss this step.
          </div>
        </div>
        <div className="my-2" />
        <div className="text-center" style={{ marginTop: '2rem' }}>
          <button
            className="btn btn-primary"
            onClick={this.props.completeOnboarding}
          >
            Finish
          </button>
        </div>
        <br />
        <div
          className={`text-center ${css.form}`}
          style={{ maxWidth: '35rem' }}
        >
          <h3>Why an app?</h3>
          <h5>
            This will allow you receive calls, while blocking all robocallers.
          </h5>
          <h6>
            Keep in mind that you will need internet access only for receiving
            phone calls while using our service.
          </h6>
          You may also use a different SIP client app if you know what to look
          for.
        </div>
      </div>
    );
  }
}
