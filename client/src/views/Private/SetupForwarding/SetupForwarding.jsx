import React, { Component } from 'react';
import i1 from './images/i1.png';
import i2 from './images/i2.png';
import i3 from './images/i3.png';
import i4 from './images/i4.png';
import a1 from './images/a1.png';
import a2 from './images/a2.png';
import a3 from './images/a3.png';
import a4 from './images/a4.png';
import a5 from './images/a5.png';

import { Emoji } from '../../../components/export';
import { redirectOnboarding } from '../../../hoc/export';

const styles = {
  image: {
    height: '35rem',
    marginBottom: '2rem'
  }
};

class SetupForwarding extends Component {
  state = {
    step: 1,
    operatingSystem: '',
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

  nextStep = () => this.setState(prevState => ({ step: prevState.step + 1 }));

  lastStep = () => this.setState(prevState => ({ step: prevState.step - 1 }));

  homeStep = () => this.setState({ step: 1, operatingSystem: '' });

  render() {
    const renderDirections = () => {
      if (this.state.operatingSystem === 'ios') {
        switch (this.state.step) {
          case 1:
            return (
              <div className="mx-auto">
                <img
                  src={i1}
                  className="d-block mx-auto border"
                  style={styles.image}
                  alt="Go to settings"
                />
                <p>Tap "Phone" </p>
              </div>
            );
          case 2:
            return (
              <div className="mx-auto">
                <img
                  src={i2}
                  className="d-block mx-auto border"
                  style={styles.image}
                  alt="Press phone settings"
                />
                <p>Tap "Call Forwarding"</p>
              </div>
            );
          case 3:
            return (
              <div className="mx-auto">
                <img
                  src={i3}
                  className="d-block mx-auto border"
                  style={styles.image}
                  alt="Press call forwarding"
                />
                <p>Make sure Call Forwarding is on, and tap "Forward To" </p>
              </div>
            );
          case 4:
            return (
              <div className="mx-auto">
                <img
                  src={i4}
                  className="d-block mx-auto border"
                  style={styles.image}
                  alt="Forward calls to the phone number we gave you"
                />
                <p>Set the phone number to {this.state.phoneNum}</p>
              </div>
            );
          default:
            return (
              <>
                <h2>
                  You're done! <Emoji value="🎉" />
                </h2>
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: '6px', marginRight: '6px' }}
                  onClick={this.lastStep}
                >
                  Previous Step
                </button>
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: '6px', marginRight: '6px' }}
                  onClick={this.homeStep}
                >
                  Back to Top
                </button>
              </>
            );
        }
      } else if (this.state.operatingSystem === 'android') {
        switch (this.state.step) {
          case 1:
            return (
              <div className="mx-auto">
                <p>
                  Steps will vary on android, so please check for your phone.
                </p>
                <img
                  src={a1}
                  className="d-block mx-auto border"
                  style={styles.image}
                  alt="Go to settings"
                />
                <p>Tap "Settings" </p>
              </div>
            );
          case 2:
            return (
              <div className="mx-auto">
                <img
                  src={a2}
                  className="d-block mx-auto border"
                  style={styles.image}
                  alt="Press Calls settings"
                />
                <p>Tap "Calls" </p>
              </div>
            );
          case 3:
            return (
              <div className="mx-auto">
                <img
                  src={a3}
                  className="d-block mx-auto border"
                  style={styles.image}
                  alt="Press GSM Call settings"
                />
                <p>Tap GSM or CDMA call settings depending on your carrier.</p>
              </div>
            );
          case 4:
            return (
              <div className="mx-auto">
                <img
                  src={a4}
                  className="d-block mx-auto border"
                  style={styles.image}
                  alt="Press Call Forwarding"
                />
                <p>Tap "Call forwarding"</p>
              </div>
            );
          case 5:
            return (
              <div className="mx-auto">
                <img
                  src={a5}
                  className="d-block mx-auto border"
                  style={styles.image}
                  alt="Always Forward calls to the phone number we gave you"
                />
                <p>
                  Tap on always forward, and set the phone number to{' '}
                  {this.state.phoneNum}
                </p>
              </div>
            );
          default:
            return (
              <>
                <h2>
                  You're done! <Emoji value="🎉" />
                </h2>
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: '6px', marginRight: '6px' }}
                  onClick={this.lastStep}
                >
                  Previous Step
                </button>
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: '6px', marginRight: '6px' }}
                  onClick={this.homeStep}
                >
                  Back to Top
                </button>
              </>
            );
        }
      } else {
        return null;
      }
    };

    const renderButtons = () => {
      if (this.state.step === 1) {
        return (
          <button className="btn btn-primary " onClick={this.nextStep}>
            Next Step
          </button>
        );
      } else if (
        (this.state.operatingSystem === 'android' && this.state.step > 5) ||
        (this.state.operatingSystem === 'ios' && this.state.step > 4)
      ) {
        return null;
      } else {
        return (
          <>
            <button
              className="btn btn-primary"
              style={{ marginLeft: '6px', marginRight: '6px' }}
              onClick={this.lastStep}
            >
              Previous Step
            </button>
            <button
              className="btn btn-primary"
              style={{ marginLeft: '6px', marginRight: '6px' }}
              onClick={this.nextStep}
            >
              Next Step
            </button>
          </>
        );
      }
    };

    return (
      <div className="text-center" style={{ minHeight: '90vh' }}>
        <h1 className="mt-5">How To Setup Call Forwarding</h1>
        {this.state.operatingSystem === '' ? (
          <div>
            <h4 className="mb-4">Pick your operating system!</h4>
            <button
              className="btn btn-primary mx-1"
              onClick={() => this.setState({ operatingSystem: 'android' })}
            >
              Android
            </button>
            <button
              className="btn btn-primary mx-1"
              onClick={() => this.setState({ operatingSystem: 'ios' })}
            >
              iOS
            </button>
          </div>
        ) : (
          <div>
            <h4 className="mb-4">Follow these steps:</h4>
            {renderDirections()}
            {renderButtons()}
          </div>
        )}
      </div>
    );
  }
}

export default redirectOnboarding(SetupForwarding);
