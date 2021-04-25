/* eslint-disable no-use-before-define */
const express = require('express');
const assert = require('assert');

const callRouter = express.Router();
const Twilio = require('twilio');

const { VoiceResponse } = Twilio.twiml;
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const encryptor = require('simple-encryptor')(process.env.ENCRYPT_SECRET);
const stripe = require('stripe')(
  process.env.NODE_ENV !== 'production'
    ? process.env.STRIPE_TEST_SECRET_KEY
    : process.env.STRIPE_LIVE_SECRET_KEY
);
const nodemailer = require('nodemailer');
const { Person } = require('../models');
const { logger, MPCallEvent } = require('../utils');

const siteUrl = process.env.SITE_URL;

// nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.PEPPER_EMAIL_ADDRESS,
    clientId: process.env.REACT_APP_GAUTH_CLIENTID,
    clientSecret: process.env.GAUTH_CLIENT_SECRET,
    refreshToken: process.env.PEPPER_GMAIL_REFRESH_TOKEN
  }
});
const pepperEmailAddress = process.env.PEPPER_EMAIL_ADDRESS;
// Connection to the Twilio API
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// eslint-disable-next-line no-unused-vars
const twilioClient = new Twilio(accountSid, authToken);

callRouter.post('/api/index', Twilio.webhook(), async (req, res) => {
  const mixpanel = await initMPCallEvent(req.body);
  try {
    mixpanel.init();
    const twiml = new VoiceResponse();
    const personObj = await Person.findOne({
      phoneNum: req.body.ForwardedFrom || req.body.CalledVia
    }).exec();
    if (!personObj || !personObj.stripeSubItemId) {
      twiml.reject();
      res.type('text/xml');
      await mixpanel.rejectNoUserFound();
      return res.send(twiml.toString());
    }
    await mixpanel.addEventData({ user_id: personObj.id });
    if (
      req.body.FromCountry !== 'US' ||
      req.body.ToCountry !== 'US' ||
      (!req.body.ForwardedFrom && !req.body.CalledVia)
    ) {
      twiml.reject();
      res.type('text/xml');
      await mixpanel.rejectInternational();
      return res.send(twiml.toString());
    }
    // Before answering the call, check if the receiver knows this number
    if (personObj.safelist.includes(req.body.From)) {
      // If they do, redirect call to SIP account
      mixpanel.safeCall();
      const objInfo = {
        firstName: personObj.firstName,
        sipUsername: personObj.sipAccount,
        email: personObj.email,
        stripeSubItemId: personObj.stripeSubItemId
      };
      const encrypted = encryptor.encrypt(objInfo);
      const encoded = encodeURIComponent(encrypted);
      twiml.redirect({ method: 'POST' }, `/call/api/redirect?param=${encoded}`);
    } else {
      // Ask the digital receptionist
      mixpanel.unknownCall();
      // generate random number for caller
      const randomNum = await randomNumGen();
      // Encrypt user data before sending it to next middleware
      const objInfo = {
        randomNum,
        data: {
          id: personObj.id,
          firstName: personObj.firstName,
          sipAccount: personObj.sipAccount,
          email: personObj.email,
          stripeSubItemId: personObj.stripeSubItemId
        }
      };
      const encrypted = encryptor.encrypt(objInfo);
      const encoded = encodeURIComponent(encrypted);

      // Prompt the caller for a number press, and send that info to a
      // middleware function to check if it's valid
      const gather = twiml.gather({
        numDigits: 1,
        timeout: 7,
        actionOnEmptyResult: true,
        action: `/call/api/gather?param=${encoded}`
      });
      gather.say(
        getVoiceInfo(),
        `Hi, I'm Pepper, a digital receptionist. Prove you're a human by pressing the number ${randomNum}`
      );
    }

    // Render the res as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    logger.error(err.stack);
    if (!res.headersSent) {
      res.type('text/xml');
      await mixpanel.rejectGeneric(err);
      return res.send(new VoiceResponse().reject().toString());
    }
  }
});

// Check if the number the caller pressed was a valid one
callRouter.post('/api/gather', Twilio.webhook(), async (req, res) => {
  const mixpanel = await initMPCallEvent(req.body);
  try {
    mixpanel.gather();
    const userInfo = encryptor.decrypt(decodeURIComponent(req.query.param));
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();

    switch (req.body.Digits) {
      // If the number was correct, add this number to the safelist
      // and redirect the call to the receiver's SIP account
      case userInfo.randomNum.toString(): {
        addToSafelist(userInfo.data.id, req.body.From);
        mixpanel.addToSafelist();
        twiml.say(getVoiceInfo(), `Thanks! Redirecting you now`);
        // encrypt data before sending to next middleware
        const objInfo = {
          firstName: userInfo.data.firstName,
          sipUsername: userInfo.data.sipAccount,
          email: userInfo.data.email,
          stripeSubItemId: userInfo.data.stripeSubItemId
        };
        const encrypted = encryptor.encrypt(objInfo);
        const encoded = encodeURIComponent(encrypted);
        twiml.redirect(
          { method: 'POST' },
          `/call/api/redirect?param=${encoded}`
        );
        break;
      }
      // If the number was incorrect, assume it's a robot and hang up
      default: {
        addToRejectedList(userInfo.data.id, req.body.From);
        await mixpanel.rejectPotentialRobot();
        twiml.say(getVoiceInfo(), "You're a robot. Goodbye.");
        twiml.hangup();
        break;
      }
    }

    // Render the response as XML in reply to the webhook request
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (err) {
    logger.error(err.stack);
    if (!res.headersSent) {
      res.type('text/xml');
      await mixpanel.rejectGeneric(err);
      return res.send(new VoiceResponse().hangup().toString());
    }
  }
});

// Redirects caller to the receiver's SIP account
callRouter.post('/api/redirect', Twilio.webhook(), async (req, res) => {
  const mixpanel = await initMPCallEvent(req.body);
  try {
    const userInfo = encryptor.decrypt(decodeURIComponent(req.query.param));
    const response = new VoiceResponse();
    const { sipUsername } = userInfo;
    const objInfo = {
      firstName: userInfo.firstName,
      email: userInfo.email,
      caller: req.body.From
    };
    const stripeInfo = userInfo.stripeSubItemId;
    const encrypted = encryptor.encrypt(objInfo);
    const encoded = encodeURIComponent(encrypted);
    const stripeEncrypted = encryptor.encrypt(stripeInfo);
    const stripeEncoded = encodeURIComponent(stripeEncrypted);
    // setup status callback to receive call details after completion
    const dial = response.dial({
      action: `/call/api/voicemail?param=${encoded}`,
      method: 'POST',
      timeout: 15
    });
    dial.sip(
      {
        statusCallbackEvent: 'completed',
        statusCallback: `${siteUrl}/call/api/payment?param=${stripeEncoded}`
      },
      `${sipUsername};transport=tls`
    );
    res.type('text/xml');
    res.send(response.toString());
  } catch (err) {
    logger.error(err.stack);
    if (!res.headersSent) {
      res.type('text/xml');
      await mixpanel.rejectGeneric(err);
      return res.send(new VoiceResponse().hangup().toString());
    }
  }
});

// Redirects to voicemail
callRouter.post('/api/voicemail', Twilio.webhook(), async (req, res) => {
  const mixpanel = await initMPCallEvent(req.body);
  try {
    const response = new VoiceResponse();
    if (req.body.DialCallStatus !== 'completed') {
      response.say('Please leave your message after the beep');
      mixpanel.redirectVoicemail();
      response.record({
        action: '/call/api/hangup',
        timeout: 3,
        maxLength: 60,
        trim: 'do-not-trim',
        recordingStatusCallback: `${siteUrl}/call/api/recording?param=${encodeURIComponent(
          req.query.param
        )}`
      });
    } else {
      mixpanel.hangup();
      response.hangup();
    }
    res.type('text/xml');
    res.send(response.toString());
  } catch (err) {
    logger.error(err.stack);
    if (!res.headersSent) {
      res.type('text/xml');
      await mixpanel.rejectGeneric(err);
      return res.send(new VoiceResponse().hangup().toString());
    }
  }
});

// Keeps tracking of usage for payment with Stripe
callRouter.post('/api/payment', Twilio.webhook(), async (req, res, next) => {
  try {
    if (req.body.CallStatus !== 'completed') {
      return res.sendStatus(200);
    }
    const stripeSubItemId = encryptor.decrypt(
      decodeURIComponent(req.query.param)
    );
    const duration = Math.ceil(Number(req.body.CallDuration) / 60);
    await stripe.usageRecords.create(stripeSubItemId, {
      quantity: duration,
      action: 'increment',
      timestamp: Math.floor(Date.now() / 1000)
    });
    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

// Email voicemail recording to user
callRouter.post('/api/recording', Twilio.webhook(), async (req, res, next) => {
  const mixpanel = await initMPCallEvent(req.body);
  try {
    // check timeout based on recording timeout in /call/api/voicemail
    res.sendStatus(200);
    const recordingTimeout = 3;
    if (
      req.body.RecordingStatus === 'completed' &&
      req.body.ErrorCode === '0' &&
      req.body.RecordingDuration > recordingTimeout
    ) {
      mixpanel.sentVoicemail();
      const userInfo = encryptor.decrypt(decodeURIComponent(req.query.param));
      const { firstName, email, caller } = userInfo;
      const formattedCaller = parsePhoneNumberFromString(
        caller
      ).formatNational();
      const mailOptions = {
        from: `'Call Pepper' <${pepperEmailAddress}>`,
        to: email,
        subject: `Voicemail From Pepper - ${formattedCaller}`,
        text: `Hi ${firstName},\n\nYou have a voicemail from ${formattedCaller}.`,
        attachments: [
          {
            filename: `voicemail-${formattedCaller}.mp3`,
            path: `${req.body.RecordingUrl}.mp3`
          }
        ]
      };
      transporter.sendMail(mailOptions, () => {
        twilioClient.recordings(req.body.RecordingSid).remove();
      });
    } else {
      logger.warn('voicemail too short, incomplete, or error code');
      twilioClient.recordings(req.body.RecordingSid).remove();
    }
  } catch (err) {
    next(err);
  }
});

callRouter.post('/api/hangup', Twilio.webhook(), async (req, res, next) => {
  const mixpanel = await initMPCallEvent(req.body);
  try {
    res.type('text/xml');
    mixpanel.hangup();
    return res.send(new VoiceResponse().hangup().toString());
  } catch (err) {
    next(err);
  }
});

// Helper Functions

const randomNumGen = async () => {
  return Math.floor(Math.random() * 10);
};

const getVoiceInfo = () => {
  return { voice: 'alice', language: 'en-us' };
};

const addToSafelist = async (userid, phoneNum) => {
  try {
    const person = await Person.findById(userid).exec();
    if (person) {
      person.safelist.push(phoneNum);
      await person.save();
    }
  } catch (err) {
    logger.error(err.stack);
  }
};

const addToRejectedList = async (userid, phoneNum) => {
  try {
    const person = await Person.findById(userid).exec();
    if (person) {
      person.rejectedList.push(phoneNum);
      await person.save();
    }
  } catch (err) {
    logger.error(err.stack);
  }
};

const initMPCallEvent = async requestBody => {
  const mixpanel = new MPCallEvent(requestBody);
  // eslint-disable-next-line camelcase
  const distinct_id = requestBody.ParentCallSid
    ? requestBody.ParentCallSid
    : requestBody.CallSid;
  assert(distinct_id, 'No distinct_id could be found');
  await mixpanel.addEventData({ distinct_id, ...requestBody });
  return mixpanel;
};

module.exports = callRouter;
