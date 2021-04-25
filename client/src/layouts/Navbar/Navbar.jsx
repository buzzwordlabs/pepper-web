import React, { Component } from 'react';
import { pepperLogo } from '../../assets/images/export';
import css from './Navbar.module.css';
import { NavLink, Link } from 'react-router-dom';
import { GlobalContext } from '../../global/GlobalContext';
import { Dropdown, Nav, Navbar as NavbarC, NavItem } from 'react-bootstrap';
export default class Navbar extends Component {
  static contextType = GlobalContext;

  render() {
    const { staticNavLinks, dashboardNavLinks, path } = this.props;
    const { isLoggedIn } = this.context.state;
    const { logout } = this.context;
    return (
      <NavbarC
        sticky="top"
        expand="md"
        className={`${css.navbarOverride} px-5 mb-4`}
      >
        <NavbarC.Brand>
          <Link className="navbar-brand" to="/">
            <img
              src={pepperLogo}
              style={{ width: '150px' }}
              alt="Pepper Logo"
            />
          </Link>
        </NavbarC.Brand>
        <NavbarC.Toggle aria-controls="responsive-navbar-nav" />
        <NavbarC.Collapse id="responsive-navbar-nav">
          <Nav className="navbar-nav mr-auto navlinks">
            {/* If user is NOT logged in render static navlinks */}
            {!isLoggedIn &&
              staticNavLinks.map((navLink, key) => {
                return (
                  <li key={key} className={`nav-item ${css.navLinkContainer}`}>
                    <NavLink
                      className={css.navLink}
                      to={navLink.path}
                      activeClassName={css.navLinkActive}
                      exact
                    >
                      {navLink.name}
                    </NavLink>
                  </li>
                );
              })}
            {/* If user is logged in, render dashboard navlinks  */}
            {isLoggedIn &&
              path.includes('/user') &&
              dashboardNavLinks.map((navLink, key) => {
                if (navLink.dropdown) {
                  return (
                    <Dropdown
                      className={`${css.navLink} ${css.navDropdown}`}
                      key={key}
                    >
                      <Dropdown.Toggle
                        as={NavItem}
                        className={`${css.navDropdownToggle}`}
                      >
                        Payment
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {navLink.childLinks.map((link, key) => {
                          return (
                            <Dropdown.Item as="button" key={key}>
                              <NavLink
                                className="dropdown-item"
                                to={link.path}
                                activeClassName={css.navLinkActive}
                              >
                                {link.name}
                              </NavLink>
                            </Dropdown.Item>
                          );
                        })}
                      </Dropdown.Menu>
                    </Dropdown>
                  );
                } else {
                  return (
                    <li
                      key={key}
                      className={`nav-item ${css.navLinkContainer}`}
                    >
                      <NavLink
                        className={css.navLink}
                        to={navLink.path}
                        activeClassName={css.navLinkActive}
                        exact
                      >
                        {navLink.name}
                      </NavLink>
                    </li>
                  );
                }
              })}
            {/* If user is logged in, but is at the root page, render static navlinks */}
            {isLoggedIn &&
              path === '/' &&
              staticNavLinks.map((navLink, key) => {
                return (
                  <li key={key} className={`nav-item ${css.navLinkContainer}`}>
                    <NavLink
                      className={css.navLink}
                      to={navLink.path}
                      activeClassName={css.navLinkActive}
                      exact
                    >
                      {navLink.name}
                    </NavLink>
                  </li>
                );
              })}
            {/* If user is logged in, but is at the static pages, render static navlinks */}
            {isLoggedIn &&
              path !== '/' &&
              !path.includes('/onboarding') &&
              !path.includes('/user') &&
              staticNavLinks.map((navLink, key) => {
                return (
                  <li key={key} className={`nav-item ${css.navLinkContainer}`}>
                    <NavLink
                      className={css.navLink}
                      to={navLink.path}
                      activeClassName={css.navLinkActive}
                      exact
                    >
                      {navLink.name}
                    </NavLink>
                  </li>
                );
              })}
          </Nav>
          <Nav className="navbar-nav ml-auto navlinks">
            {/* If user is not logged in, render login buttons */}
            {/* Make website static while working on mobile app */}
            {/* {!isLoggedIn && !path.includes('/login') && (
              <>
                <li className="nav-item">
                  <Link to="/login">
                    <button className="btn btn-success btn-sm m-1">
                      Login
                    </button>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login">
                    <button className="btn btn-primary btn-sm m-1">
                      Get Started
                    </button>
                  </Link>
                </li>
              </>
            )} */}
            {/* If user is logged in and at the static page, render button to go to dashboard */}
            {isLoggedIn &&
            path !== '/' &&
            !path.includes('/onboarding') &&
            !path.includes('/user') ? (
              <>
                <li>
                  <Link to="/user/settings" className="nav-item">
                    <button className="btn btn-primary btn-sm my-1">
                      Dashboard
                    </button>
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-danger btn-sm my-1 mx-1 d-block"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : null}
            {isLoggedIn && path === '/' ? (
              <>
                <li className="nav-item">
                  <Link to="/user/settings">
                    <button className="btn btn-primary btn-sm my-1">
                      Dashboard
                    </button>
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-danger btn-sm my-1 mx-1 d-block"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : null}
            {/* If user is logged in and at the dashboard, only render logout button */}
            {isLoggedIn && path.includes('/user') ? (
              <>
                <li className="nav-item">
                  <button
                    className="btn btn-danger btn-sm mx-1 d-block"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : null}
          </Nav>
        </NavbarC.Collapse>
      </NavbarC>
    );
  }
}
