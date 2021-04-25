import React from 'react';
import { pepperLogo } from '../../assets/images/export';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <hr className="my-0 mt-4" />
      <footer
        className="page-footer font-small"
        style={{
          padding: '2rem 3rem',
          bottom: 0
        }}
      >
        <div className="container-fluid text-center text-md-left">
          <div className="row">
            <div className="col-sm-8 col-12 offset-sm-2 mt-md-0 mt-3">
              <Link to="/">
                <img
                  src={pepperLogo}
                  className="logo d-block mx-auto mb-3"
                  alt="Pepper Logo"
                />
              </Link>
              <p className="text-center">
                Robocalls. Everyone gets them and everyone hates them —
                including us. <br />
                <br />
                That's why we're on a conquest to get rid of the pesky spam
                robocalls.
              </p>
            </div>
          </div>
        </div>
        <div className="footer-copyright text-center mb-3 ">
          <p>© 2019 Buzzword Labs Inc.</p>
        </div>
        <div className="text-center mb-3">
          <Link
            style={{ color: 'black', textDecoration: 'none' }}
            to="/privacy-policy"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="text-center mb-3">
          <Link
            style={{ color: 'black', textDecoration: 'none' }}
            to="/terms-of-service"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </>
  );
}
