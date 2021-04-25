const express = require('express');

const userRouter = express.Router();
const Twilio = require('twilio');
const axios = require('axios');
const querystring = require('querystring');
const cheerio = require('cheerio');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const { Person } = require('../../models');
const jwt = require('./jwt');
const { analytics } = require('../../utils');

// Connection to the Twilio API
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioServiceID = process.env.TWILIO_SERVICE_ID;
const twilioClient = new Twilio(accountSid, authToken);

// Set value in DB when user completes onboarding
userRouter.post('/complete', async (req, res, next) => {
  try {
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      person.onboardingStep = 0;
      await person.save();
      analytics.event('Onboarding', 'Completed Onboarding').send();
      const newJWT = await jwt.create(0);
      req.session.onboardingStep = 0;
      return res.status(200).json({ token: newJWT });
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

// send phone number to Twilio to verify
userRouter.post('/phone-input', async (req, res, next) => {
  try {
    if (!req.body.phone) {
      return res.sendStatus(400);
    }
    const phoneNumber = parsePhoneNumberFromString(req.body.phone);
    if (
      !phoneNumber ||
      phoneNumber.country !== 'US' ||
      !phoneNumber.isValid()
    ) {
      return res.sendStatus(400);
    }
    // verify phone via SMS with Twilio verify API
    const verification = await twilioClient.verify
      .services(twilioServiceID)
      .verifications.create({ to: req.body.phone, channel: 'sms' });
    if (verification.status === 'pending' && verification.valid === false) {
      analytics.event('Onboarding', 'Completed Phone Input').send();
      return res.sendStatus(200);
    }
    return res.sendStatus(500);
  } catch (err) {
    next(err);
  }
});

// verify user code sent by Twilio
userRouter.post('/phone-verify', async (req, res, next) => {
  try {
    if (!req.body.phone || !req.body.code || !req.body.onboardingStep) {
      return res.sendStatus(400);
    }
    const phoneNumber = parsePhoneNumberFromString(req.body.phone);
    if (
      !phoneNumber ||
      phoneNumber.country !== 'US' ||
      !phoneNumber.isValid()
    ) {
      return res.sendStatus(400);
    }
    const existingNumber = await Person.countDocuments({
      phoneNum: phoneNumber.number
    });
    if (existingNumber > 0) {
      return res.sendStatus(409);
    }
    // verify code sent via SMS with Twilio verify API
    const verification = await twilioClient.verify
      .services(twilioServiceID)
      .verificationChecks.create({
        to: req.body.phone,
        code: req.body.code
      });
    if (verification.status === 'approved' && verification.valid === true) {
      const person = await Person.findById(req.session.id).exec();
      if (person) {
        person.phoneNum = verification.to;
        person.onboardingStep = req.body.onboardingStep + 1;
        await person.save();
        analytics.event('Onboarding', 'Completed Phone Verification').send();
        const newJWT = await jwt.create(req.body.onboardingStep + 1);
        req.session.onboardingStep = req.body.onboardingStep + 1;
        return res.status(200).json({ token: newJWT });
      }
      req.session = null;
      return res.sendStatus(401);
    }
    return res.sendStatus(500);
  } catch (err) {
    next(err);
  }
});

// create sip account via linphone
userRouter.post('/create-sip', async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password || !req.body.onboardingStep) {
      return res.sendStatus(400);
    }
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      // subscribe user to linphone.org free SIP account
      const { username, password } = req.body;
      const reqdata = {
        username,
        password,
        confirm: password,
        email: person.email,
        first: person.firstName,
        last: person.lastName,
        subscribe: '1',
        op: 'CREATE NOW!',
        form_id: 'create_account_form'
      };
      const response = await axios({
        method: 'post',
        url: 'https://www.linphone.org/freesip/home',
        data: querystring.stringify(reqdata),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const errorMsg = $('.messages--error').text();
        // linphone will always send back an error because
        // it can't create a session the proper error with
        // 'Notice' at the beginning means that it worked
        if (errorMsg.split('\n')[2].substr(0, 6) !== 'Notice') {
          if (errorMsg.split('\n')[2] === 'This username already exists.') {
            return res
              .status(409)
              .send({ errorMessage: 'This username already exists.' });
          }
          if (
            errorMsg.split('\n')[2].substr(0, 21) === 'Username is incorrect'
          ) {
            return res.status(409).send({
              errorMessage:
                'Username format is correct, see guidelines in blue text.'
            });
          }
          return res
            .status(409)
            .send({ errorMessage: errorMsg.split('\n')[2] });
        }
        person.sipAccount = `sip:${username}@sip.linphone.org`;
        person.onboardingStep = req.body.onboardingStep + 1;
        await person.save();
        analytics.event('Onboarding', 'Completed Phone Input').send();
        const newJWT = await jwt.create(req.body.onboardingStep + 1);
        req.session.onboardingStep = req.body.onboardingStep + 1;
        return res.status(200).json({ token: newJWT });
      }
      return res.sendStatus(500);
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

module.exports = userRouter;
