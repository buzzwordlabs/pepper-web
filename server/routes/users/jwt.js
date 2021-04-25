const jwt = require('jsonwebtoken');

const privateKey = process.env.AUTH_PRIVATE_KEY;

// make a JWT token with the onboardingStep in the payload
const create = async onboardingStep => {
  const payload = {
    onboardingStep
  };
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '2h'
      },
      (err, newJWT) => {
        if (err) {
          reject(err);
        } else if (newJWT) {
          resolve(newJWT);
        } else {
          reject(new Error('JWT token not generated'));
        }
      }
    );
  });
};

module.exports = { create };
