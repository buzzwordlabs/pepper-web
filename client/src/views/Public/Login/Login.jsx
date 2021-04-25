import React, { Component } from 'react';
import { GoogleLogin } from 'react-google-login';
import { Link, Redirect } from 'react-router-dom';
import { GlobalContext } from '../../../global/GlobalContext';
import { google, undrawLogin } from '../../../assets/images/export';
import { toast } from 'react-toastify';
import { verify } from 'jsonwebtoken';
export default class Login extends Component {
  static contextType = GlobalContext;

  state = {
    redirectToDashboard: false,
    redirectToOnboarding: false
  };

  successResponseGoogle = res => {
    fetch('/auth/google', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + res.code
      }
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error(res.status.toString());
      })
      .then(json => {
        // verify retrieved token
        const verifiedToken = verify(
          json.token,
          process.env.REACT_APP_AUTH_PUBLIC_KEY,
          {
            algorithms: ['RS256']
          },
          (err, token) => {
            if (err) {
              throw new Error();
            }
            return token;
          }
        );
        const { onboardingStep } = verifiedToken;
        // Tell global state that user is logged in
        this.context.login();
        this.context.changeOnboardingStep(onboardingStep);
        localStorage.setItem('token', json.token);
        // If user completed onboarding, redirect to dashboard
        if (onboardingStep === 0)
          return this.setState({ redirectToDashboard: true });
        // If user has not, redirect to onboarding
        return this.setState({
          redirectToOnboarding: true
        });
      })
      .catch(err => {
        if (err.message === '401')
          return toast.error(
            'Please go to https://myaccount.google.com/permissions and revoke permission for Pepper. Try logging in again after that.'
          );
        return toast.error('There was an error. Try logging in again.');
      });
    this.setState({ isLoading: false });
  };

  failResponseGoogle = res => {
    this.setState({ isLoading: false });
  };

  render() {
    const { redirectToDashboard, redirectToOnboarding } = this.state;
    if (redirectToDashboard) return <Redirect to="/user/settings" />;
    else if (redirectToOnboarding) return <Redirect to="/user/onboarding" />;

    return (
      <div className="container">
        <div className="row">
          <div className="col-10 col-md-8 col-xl-8 offset-md-2 offset-xl-2 offset-1">
            <h1 className="text-center">Login</h1>
            <div
              className="d-flex flex-column align-content-center"
              style={{ minHeight: '500px' }}
            >
              <img
                src={undrawLogin}
                style={{ maxWidth: '20rem' }}
                className="img-fluid mx-auto mt-5"
                alt="Authentication vector"
              />
              <div className="my-2 mx-auto">
                <GoogleLogin
                  clientId={process.env.REACT_APP_GAUTH_CLIENTID}
                  buttonText="Login with Google"
                  scope="profile email https://www.googleapis.com/auth/contacts.readonly"
                  responseType="code"
                  uxMode="redirect"
                  accessType="offline"
                  onSuccess={this.successResponseGoogle}
                  onFailure={this.failResponseGoogle}
                  render={renderProps => (
                    <button
                      className="btn btn-light border"
                      onClick={renderProps.onClick}
                    >
                      <img
                        style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          marginRight: '0.5rem'
                        }}
                        className="align-top"
                        src={google}
                        alt="Google Icon"
                      />
                      Login with Google
                    </button>
                  )}
                />
              </div>
              <p className="text-center my-3" style={{ fontSize: '0.8rem' }}>
                By clicking "Login with Google" I agree to Pepper's{' '}
                <Link to="/privacy-policy">Privacy Policy</Link> and{' '}
                <Link to="/terms-of-service">Terms of Service</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
