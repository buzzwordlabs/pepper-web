import React from 'react';
import { Emoji, LoadingSubmit } from '../../../components/export';
import css from './Contact.module.css';
import { ReCaptcha, loadReCaptcha } from 'react-recaptcha-google';
import { toast } from 'react-toastify';
import { Redirect } from 'react-router-dom';
import validator from 'validator';
export default class Contact extends React.Component {
  state = {
    name: '',
    email: '',
    message: '',
    isVerified: false,
    isCompleted: false,
    isLoading: false
  };

  componentDidMount() {
    loadReCaptcha();
  }

  submit = e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    const { name, email, message } = this.state;
    if (name === '' || email === '' || message === '') {
      toast.error('Name, email, or message cannot be blank.');
      return this.setState({ isLoading: false });
    }
    if (!validator.isEmail(email)) {
      toast.error('Email is invalid. Try again.');
      return this.setState({ isLoading: false });
    }
    // If use successfully clicked the Recaptcha, send form data
    if (this.state.isVerified) {
      fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          message
        })
      })
        .then(res => {
          if (res.ok) {
            toast.success('Success! Email was sent.');
            return this.setState({ isCompleted: true });
          }
          throw new Error();
        })
        .catch(err => toast.error('Something went wrong.'));
      return this.setState({ isLoading: false });
    }
    // If the user is not verified yet, raise an error and tell them to click the Recaptcha
    return toast.error('Please verify you are not a robot with the Recaptcha.');
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

  recaptchaLoaded = () => {
    if (this.captcha) {
      this.captcha.reset();
    }
  };

  verifyCallback = recaptchaToken => {
    if (recaptchaToken) {
      fetch(`/contact/recaptcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recaptcha: recaptchaToken })
      })
        .then(res => {
          if (res.ok) return this.setState({ isVerified: true });
          throw new Error(res.status.toString());
        })
        .catch(err => {
          toast.error('Something went wrong.');
        });
    }
  };

  render() {
    const { isLoading, isVerified, isCompleted } = this.state;
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-12">
            <h1 className="text-center">
              Contact Us
              <Emoji value="📧" ariaLabel="Email Emoji" />
            </h1>
            <h5 className="text-center">Message us for anything!</h5>
            <br />
            <h5 className="text-center mb-5">
              Questions, feedback, and random messages are welcome.
            </h5>
            {isCompleted ? (
              <Redirect to="/" />
            ) : (
              <form
                onSubmit={this.submit}
                id="contactForm"
                className={css.form}
              >
                <label />
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  form="contactForm"
                  minLength="1"
                  title="Minimum length is 1"
                  className={css.textField}
                  onChange={this.handleChange}
                  required
                />
                <label />
                <input
                  type="email"
                  name="email"
                  placeholder="you@gmail.com"
                  title="Ex: you@gmail.com"
                  form="contactForm"
                  minLength="1"
                  className={css.textField}
                  onChange={this.handleChange}
                  required
                />

                <label />
                <textarea
                  type="textbox"
                  name="message"
                  placeholder="Your feedback or questions"
                  form="contactForm"
                  minLength="1"
                  title="Minimum length is 1"
                  className={css.textAreaField}
                  onChange={this.handleChange}
                />
                <ReCaptcha
                  ref={el => {
                    this.captcha = el;
                  }}
                  size="normal"
                  render="explicit"
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITEKEY}
                  onloadCallback={this.recaptchaLoaded}
                  verifyCallback={this.verifyCallback}
                />
                <LoadingSubmit
                  className="btn btn-primary d-block my-4"
                  value="Submit Message"
                  loadingValue="Loading..."
                  isLoading={isLoading}
                  disabled={!isVerified && true}
                />
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }
}
