import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { GlobalContext } from '../global/GlobalContext';
import { toast } from 'react-toastify';

const redirectOnboarding = OriginalComponent => {
  class RedirectOnboarding extends Component {
    static contextType = GlobalContext;
    state = {
      redirectLogin: this.context.state.isLoggedIn && true,
      redirectOnboarding: this.context.state.onboardingStep !== 0,
      isLoggedIn: this.context.state.isLoggedIn,
      onboardingStep: this.context.state.onboardingStep
    };

    componentDidUpdate() {
      if (!this.state.isLoggedIn) return this.setState({ redirectLogin: true });
      if (this.state.onboardingStep !== 0)
        return this.setState({ redirectOnboarding: true });
    }

    promptLogin = () => {
      this.context.logout();
      this.setState({ redirectLogin: true });
    };

    render() {
      const { redirectOnboarding, isLoggedIn } = this.state;

      // If the user is not logged in, redirect them to login
      if (!isLoggedIn) {
        toast.warning('Please login.');
        return <Redirect to="/login" />;
      }
      // If the user hasn't completed onboarding, redirect them to onboarding
      if (redirectOnboarding) {
        toast.warning('Please complete onboarding.');
        return <Redirect to="/user/onboarding" />;
      }
      // If the user has passed both of these conditions, render normally
      return <OriginalComponent />;
    }
  }
  return RedirectOnboarding;
};

export default redirectOnboarding;
