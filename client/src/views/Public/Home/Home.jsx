import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../../../global/GlobalContext';
import { Tier } from '../../../components/export';
import { Card, Row, Container, Col } from 'react-bootstrap';
import css from './Home.module.css';
import {
  undrawCalling,
  app,
  signup,
  confirm
} from '../../../assets/images/export';

const tiers = [
  {
    name: 'Bell Pepper',
    flatPrice: '$2',
    minutes: '50 minutes/mo',
    details: 'on incoming calls',
    smallDetails: '$0.04/min after 50 minutes',
    numFlames: 1
  },
  {
    name: 'Black Pepper',
    flatPrice: '$7 ',
    minutes: '200 minutes/mo',
    details: 'on incoming calls',
    smallDetails: '$0.04/min after 200 minutes',
    numFlames: 2
  },
  {
    name: 'Chili Pepper',
    flatPrice: '$14',
    minutes: '400 minutes/mo',
    details: 'on incoming calls',
    smallDetails: '$0.04/min after 400 minutes',
    numFlames: 3
  },
  {
    name: 'Ghost Pepper',
    flatPrice: '$0.04/min',
    minutes: 'Unlimited',
    details: 'on incoming calls',
    numFlames: 4
  }
];

export default function Home(props) {
  const context = useContext(GlobalContext);
  return (
    <>
      <Container fluid className="px-5">
        <div>
          {/* Hero */}
          <Row>
            <Col xs={12} md={6} className="my-5">
              <h1 className="mt-0 font-weight-bold">
                Robocalls Will Become A Thing of the Past
              </h1>
              <br />
              <p className="p-text">
                Everyone gets them and everyone hates them — including us.
              </p>
              <h5>Interested in joining our conquest to end robocalls?</h5>
              {context.state.isLoggedIn ? (
                <Link to="/user/settings">
                  <button type="button" className="btn btn-lg btn-primary my-3">
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                // Make website static while working on mobile app
                // <Link to="/login">
                //   <button type="button" className="btn btn-lg btn-primary my-3">
                //     Get Started
                //   </button>
                // </Link>
                <div id="mc_embed_signup">
                  <form
                    style={{
                      padding: 0,
                      paddingTop: '1rem',
                      paddingBottom: '3rem'
                    }}
                    action="https://gmail.us20.list-manage.com/subscribe/post?u=22524111d93313f570c841d4b&id=2690180905"
                    method="post"
                    id="mc-embedded-subscribe-form"
                    name="mc-embedded-subscribe-form"
                    className="validate"
                    target="_blank"
                    noValidate
                  >
                    <div id="mc_embed_signup_scroll">
                      <h3 htmlFor="mce-EMAIL">Join The Waiting List</h3>
                      <p style={{ maxWidth: '25rem' }}>
                        We're building a mobile app right now, and we'll let you
                        know when we launch.
                      </p>
                      <input
                        className="my-4 form-control"
                        style={{ width: '18rem' }}
                        type="email"
                        name="EMAIL"
                        id="mce-EMAIL"
                        placeholder="Email"
                        required
                      />
                      <div
                        style={{ position: 'absolute', left: '-5000px' }}
                        aria-hidden="true"
                      >
                        <input
                          type="text"
                          name="b_c36fa093cbd11b379d7b286c2_47295f1a1b"
                          tabIndex={-1}
                          defaultValue
                        />
                      </div>
                      <div className="clear">
                        <input
                          type="submit"
                          defaultValue="Join"
                          name="subscribe"
                          id="mc-embedded-subscribe"
                          className="btn btn-primary btn-lg"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </Col>
            <Col xs={12} md={6} className="my-5">
              <img
                className="img-fluid"
                src={undrawCalling}
                alt="A Phone Call"
              />
            </Col>
          </Row>
          <hr className="mx-5" />
          <Row>
            <Col xs={12} className="text-center my-5">
              <h1>How It Works</h1>
            </Col>
            <Col xs={12} md={4}>
              <Card className={`mb-5 ${css.cardOverride}`}>
                <Card.Img
                  variant="top"
                  src={signup}
                  className={css.imgOverride}
                />
                <Card.Body>
                  <h3>Sign Up</h3>
                  <Card.Text>
                    Make an account, and we'll get you everything you need to
                    start blocking robocalls.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className={`mb-5 ${css.cardOverride}`}>
                <Card.Img variant="top" src={app} className={css.imgOverride} />
                <Card.Body>
                  <h3>Download An App</h3>
                  <Card.Text>
                    We're in the process of building an app you can use to
                    receive calls from people. Think of it as an email spam
                    filter for phonecalls.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className={`mb-5 ${css.cardOverride}`}>
                <Card.Img
                  variant="top"
                  src={confirm}
                  className={css.imgOverride}
                />
                <Card.Body>
                  <h3>Setup Spam Blocking</h3>
                  <Card.Text>
                    If you get a call from a number not in your contacts, we
                    verify that they're a human and block them if they're not.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} className="p-0">
              {context.state.isLoggedIn ? (
                <Link to="/user/settings" style={{ textDecoration: 'none' }}>
                  <button
                    type="button"
                    className="btn btn-lg btn-primary mb-5 mx-auto d-block"
                  >
                    Dashboard
                  </button>
                </Link>
              ) : (
                // Make website static while working on mobile app
                // <Link to="/login" style={{ textDecoration: 'none' }}>
                //   <button
                //     type="button"
                //     className="btn btn-lg btn-primary mb-5 mx-auto d-block"
                //   >
                //     Get Started
                //   </button>
                // </Link>
                <></>
              )}
            </Col>
          </Row>
          {/* Pricing */}
          <hr className="mx-5" />
          <Row className="text-center mx-0">
            <Col xs={12} md={{ span: 10, offset: 1 }} className="my-4 p-0">
              <h1 className="my-5 text-center">Pricing</h1>
              <Row>
                {tiers.map((tier, key) => {
                  return (
                    <Col key={key}>
                      <Tier
                        minutes={tier.minutes}
                        details={tier.details}
                        smallDetails={tier.smallDetails}
                        flatPrice={tier.flatPrice}
                        name={tier.name}
                        numFlames={tier.numFlames}
                      />
                    </Col>
                  );
                })}
              </Row>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
}
