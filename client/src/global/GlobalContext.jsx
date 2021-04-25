import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { verify } from 'jsonwebtoken';

const GlobalContext = React.createContext();

class GlobalContextProvider extends Component {
  state = {
    isLoggedIn: false,
    onboardingStep: 1
  };

  componentDidMount() {
    // Grab current token in localStorage
    const jwt = localStorage.getItem('token');
    if (!jwt) return this.setState({ isLoggedIn: false });
    // Verify that the jwt token is not tampered with
    const token = verify(
      jwt,
      process.env.REACT_APP_AUTH_PUBLIC_KEY,
      {
        algorithms: ['RS256']
      },
      (err, verifiedToken) => {
        if (err) return this.setState({ isLoggedIn: false });
        return verifiedToken;
      }
    );
    // If the token is valid, set isLoggedIn to true
    if (token) {
      return this.setState({
        isLoggedIn: true,
        onboardingStep: token.onboardingStep
      });
    }
  }

  login = () => {
    return this.setState({
      isLoggedIn: true
    });
  };

  changeOnboardingStep = step => {
    return this.setState({
      onboardingStep: step
    });
  };

  logout = () => {
    fetch('/user/logout', {
      method: 'GET'
    })
      .then(res => {
        if (res.ok) {
          localStorage.removeItem('token');
          return this.setState({ isLoggedIn: false });
        }
        throw new Error();
      })
      .catch(() => {
        toast.error('Something went wrong.');
        // Even if there is an error, log them out to be safe
        localStorage.removeItem('token');
        return this.setState({ isLoggedIn: false });
      });
    return;
  };

  logoutFrontend = () => {
    try {
      localStorage.removeItem('token');
      return this.setState({ isLoggedIn: false });
    } catch (err) {
      return toast.error('Something went wrong');
    }
  };

  render() {
    return (
      <GlobalContext.Provider
        value={{
          state: this.state,
          login: this.login,
          logout: this.logout,
          changeOnboardingStep: this.changeOnboardingStep,
          logoutFrontend: this.logoutFrontend
        }}
      >
        {this.props.children}
      </GlobalContext.Provider>
    );
  }
}

export { GlobalContext, GlobalContextProvider };
