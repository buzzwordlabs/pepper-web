const express = require('express');

const contactRouter = express.Router();
const nodemailer = require('nodemailer');
const axios = require('axios');
const validator = require('validator');

const recaptchaSecret = process.env.RECAPTCHA_SECRETKEY;
const pepperEmailAddress = process.env.PEPPER_EMAIL_ADDRESS;
const googleClientId = process.env.REACT_APP_GAUTH_CLIENTID;
const googleClientSecret = process.env.GAUTH_CLIENT_SECRET;
const pepperRefreshToken = process.env.PEPPER_GMAIL_REFRESH_TOKEN;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    type: 'OAuth2',
    user: pepperEmailAddress,
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    refreshToken: pepperRefreshToken
  }
});

contactRouter.post('/', (req, res, next) => {
  if (
    !req.body.name ||
    !validator.isEmail(req.body.email) ||
    !req.body.message
  ) {
    return res.sendStatus(400);
  }
  const mailOptions = {
    from: `'Call Pepper' <${pepperEmailAddress}>`,
    to: pepperEmailAddress,
    subject: 'Pepper Contact Form',
    html: `Message from: ${req.body.name}<br></br> Email: ${req.body.email}<br></br> Message: ${req.body.message}`
  };
  transporter.sendMail(mailOptions, (error, response) => {
    if (error) {
      return next(error);
    }
    if (response) {
      return res.sendStatus(200);
    }
  });
});

contactRouter.post('/recaptcha', async (req, res, next) => {
  try {
    if (!req.body.recaptcha) {
      return res.sendStatus(400);
    }
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${req.body.recaptcha}`
    );
    res.send(response.data);
  } catch (err) {
    next(err);
  }
});

module.exports = contactRouter;
