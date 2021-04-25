const express = require('express');

const userRouter = express.Router();
const onboarding = require('./onboarding');
const payment = require('./payment');
const settings = require('./settings');
const { analytics } = require('../../utils');

const twilioPhoneNum = process.env.TWILIO_NUM;

userRouter.use((req, res, next) => {
  if (!req.session.id) return res.sendStatus(401);
  next();
});

// logout user
userRouter.get('/logout', (req, res) => {
  analytics.event('User', 'Logged Out').send();
  req.session = null;
  return res.sendStatus(200);
});

userRouter.get('/phone-number', (req, res) => {
  return res.status(200).json({ phoneNum: twilioPhoneNum });
});

userRouter.use('/onboarding', onboarding);
userRouter.use('/settings', settings);
userRouter.use('/payment', payment);

module.exports = userRouter;
