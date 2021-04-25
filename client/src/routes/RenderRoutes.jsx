import React from 'react';
import { PrivateRoute } from '../components/export';
import { staticRoutes, dashboardRoutes } from './export';
import { Error404 } from '../views/export';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import { Layout } from '../layouts/export';

export default function RenderRoutes() {
  return (
    <BrowserRouter basename="/">
      <ScrollToTop>
        <Switch>
          {/* Render the staticRoutes */}
          {staticRoutes.map((prop, key) => {
            const Component = prop.component;
            return (
              <Route
                exact
                path={prop.path}
                key={key}
                render={props => (
                  <Layout>
                    <Component {...props} />
                  </Layout>
                )}
                name={prop.name}
              />
            );
          })}
          {/* Render the dashboardRoutes */}
          {/* Make website static while working on mobile app */}
          {/* {dashboardRoutes.map((prop, key) => (
            <PrivateRoute
              exact
              path={prop.path}
              key={key}
              component={prop.component}
              name={prop.name}
            />
          ))} */}
          <Route
            name="404"
            render={props => (
              <Layout>
                <Error404 {...props} />
              </Layout>
            )}
          />
          ;
        </Switch>
      </ScrollToTop>
    </BrowserRouter>
  );
}
