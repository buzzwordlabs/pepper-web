import React from 'react';
import { Footer, Navbar } from '../export';
import { withRouter } from 'react-router-dom';

const staticNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Contact', path: '/contact' }
];

const dashboardNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Settings', path: '/user/settings' },
  {
    name: 'Payment',
    dropdown: true,
    childLinks: [
      { path: '/user/payment/settings', name: 'Payment Settings' },
      { path: '/user/payment/update-card', name: 'Update Card' },
      { path: '/user/payment/unsubscribe', name: 'Unsubscribe' }
    ]
  },
  { name: 'Call Forwarding', path: '/user/setup-forwarding' },
  { name: 'Delete Account', path: '/user/delete-account' }
];

function Layout(props) {
  return (
    <>
      <Navbar
        staticNavLinks={staticNavLinks}
        dashboardNavLinks={dashboardNavLinks}
        path={props.match.path}
      />
      {props.children}
      <Footer />
    </>
  );
}

export default withRouter(Layout);
