import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { GlobalContext } from '../../global/GlobalContext';
import { Layout } from '../../layouts/export';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isLoggedIn } = useContext(GlobalContext).state;
  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          // If the user is logged in, render the requested page
          <Layout>
            <Component {...props} />
          </Layout>
        ) : (
          // Else, redirect the user to the login page
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
