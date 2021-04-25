import React, { useContext } from 'react';
import { undraw404 } from '../../../assets/images/export';
import { GlobalContext } from '../../../global/GlobalContext';
import { Link } from 'react-router-dom';

export default function Error404() {
  const context = useContext(GlobalContext);
  return (
    <div className="container">
      <div className="row">
        <div className="col-10 col-md-8 col-xl-8 offset-md-2 offset-xl-2 offset-1">
          <div className="mx-auto">
            <h1 className="text-center">404</h1>
            <h3 className="my-5 text-center">
              Uh oh! This page got abducted by aliens. Sorry!
            </h3>
            <img
              src={undraw404}
              className="img-fluid mx-auto d-block"
              style={{ maxWidth: '20rem' }}
              alt="404 Vector"
            />
            <Link to={context.state.isLoggedIn ? '/user/settings' : '/'}>
              <button className="btn btn-sm btn-primary mx-auto my-5 d-block">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
