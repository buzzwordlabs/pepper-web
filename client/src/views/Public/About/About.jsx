import React from 'react';
import { Emoji } from '../../../components/export';
import ethan from './ethan-profile-pic.jpg';
import ani from './ani-profile-pic.jpeg';
import { github, linkedin, twitter } from '../../../assets/icons/export';

export default function About() {
  return (
    <div className="container">
      <h1 className="text-center">
        About Us
        <Emoji value="😆" ariaLabel="Grinning Squinting Emoji" />
      </h1>
      <div className="row my-5 text-center">
        <div className="col-md-6 offset-md-3 col-12">
          <h2 className="mb-5">Why did you decide to build Pepper?</h2>
          <p className="text-left">
            We both hate robocalls with a passion. They've been on the rise the
            past year, but they've been getting out of control lately.{' '}
            <a href="https://firstorion.com/nearly-50-of-u-s-mobile-traffic-will-be-scam-calls-by-2019/">
              50% of all calls in the US in 2019 are expected to be
              spam/robocalls.
            </a>
          </p>
          <p className="text-left">
            We started off by building a solution that worked for both of us. We
            wanted other people to be able to use this thing we created, and
            that's where we are now — trying to build the best possible product
            that can finally put an <strong>end</strong> to robocalls forever.
          </p>
        </div>
      </div>
      <hr />
      <div className="row my-2">
        <div className="col-12 col-md-6">
          <TeamMember
            image={ethan}
            tagline="Co-Founder of Pepper"
            currentPosition=""
            linkedinLink="https://www.linkedin.com/in/ethannaluz/"
            twitterLink="https://twitter.com/ethannaluz"
            githubLink="https://github.com/enaluz"
          />
        </div>
        <div className="col-12 col-md-6">
          <TeamMember
            image={ani}
            tagline="Co-Founder of Pepper"
            currentPosition=""
            linkedinLink="https://www.linkedin.com/in/aniravichandran/"
            twitterLink="https://twitter.com/therealAniRavi"
            githubLink="https://github.com/aniravi24"
          />
        </div>
      </div>
    </div>
  );
}

const TeamMember = props => {
  const styles = {
    profilePic: {
      maxWidth: '20rem',
      borderRadius: '100%',
      margin: '0 auto',
      display: 'block'
    },
    icon: {
      maxWidth: '2rem',
      margin: '0 0.5rem',
      display: 'inline-block'
    },
    info: {
      margin: '2rem 5rem'
    }
  };

  const {
    image,
    tagline,
    currentPosition,
    linkedinLink,
    githubLink,
    twitterLink
  } = props;

  return (
    <div className="py-3">
      <img
        src={image}
        alt="Team member"
        className="border"
        style={styles.profilePic}
      />
      <div className="text-center" style={styles.info}>
        <p>{tagline}</p>
        <p>{currentPosition}</p>
        <a href={linkedinLink}>
          <img src={linkedin} alt="Linkedin Icon" style={styles.icon} />
        </a>
        <a href={githubLink}>
          <img src={github} alt="Github Icon" style={styles.icon} />
        </a>
        <a href={twitterLink}>
          <img src={twitter} alt="Twitter Icon" style={styles.icon} />
        </a>
      </div>
    </div>
  );
};
