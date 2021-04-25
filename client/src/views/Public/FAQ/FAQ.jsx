import React, { Component } from 'react';
import { Accordion, Emoji } from '../../../components/export';
import { Link } from 'react-router-dom';

export default class FAQ extends Component {
  state = {
    faq: []
  };

  componentDidMount() {
    fetch(`/faq/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(json => {
        this.setState({ faq: json.faq });
      })
      .catch(err => {});
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6 offset-md-3">
            <h1 className="text-center">
              Frequently Asked Questions{' '}
              <Emoji value="🤔" ariaLabel="Thinking Emoji" />
            </h1>
            <h4 className="text-center mb-5">
              Got questions? We've got answers.
            </h4>
            <Accordion data={this.state.faq} id="faqs" />
            <h5 className="mt-4 text-center">
              Still need help?
              <Link to="/contact"> Contact us.</Link>
            </h5>
          </div>
        </div>
      </div>
    );
  }
}
