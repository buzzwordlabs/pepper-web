import React, { Component } from 'react';
import { Emoji, LoadingSubmit } from '../../../components/export';
import css from './DeleteAccount.module.css';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { redirectOnboarding } from '../../../hoc/export';
class DeleteAccount extends Component {
  state = {
    email: '',
    isLoading: false,
    redirect: false
  };

  submitDelete = e => {
    e.preventDefault();
    const { email } = this.state;

    this.setState({ isLoading: true });

    fetch('/user/settings/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
      .then(res => {
        if (res.ok) {
          toast.success('Your account was successfully deleted.');
          return this.context.logoutFrontend();
        }
        throw new Error(res.status.toString());
      })
      .catch(err => {
        if (err.message === '401') {
          toast.error('Please login to access that page.');
          return this.setState({ redirect: true });
        } else if (err.message === '400') {
          toast.error('Wrong email was entered. Please try again.');
        } else {
          return toast.error('Something went wrong.');
        }
      });
    this.setState({ isLoading: false });
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

  render() {
    const { handleChange, submitDelete } = this;
    const { isLoading, inputText, redirect } = this.state;
    const { inputField, form } = css;
    if (redirect) return <Redirect to="/login" />;
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6 offset-md-3 my-5">
            <h1 className="text-center">
              We're sad to see you go <Emoji value="😢" />
            </h1>
            <h3 className="my-5 text-center">But we understand.</h3>
            <h5 className="my-5 text-center">
              If you <em>really</em> want to delete your account, just enter
              your email address.
            </h5>
            <form className={form} onSubmit={submitDelete}>
              <label className="text-left">Email</label>
              <input
                type="text"
                name="email"
                className={inputField}
                value={inputText}
                onChange={handleChange}
                required
              />
              <LoadingSubmit
                text="Delete Account"
                loadingText="Deleting..."
                className="btn btn-danger mt-3"
                isLoading={isLoading}
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default redirectOnboarding(DeleteAccount);
