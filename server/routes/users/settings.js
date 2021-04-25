const express = require('express');

const settingsRouter = express.Router();
const { google } = require('googleapis');
const stripe = require('stripe')(
  process.env.NODE_ENV !== 'production'
    ? process.env.STRIPE_TEST_SECRET_KEY
    : process.env.STRIPE_LIVE_SECRET_KEY
);
const { Person } = require('../../models');
const { analytics } = require('../../utils');

// retrieve user settings
settingsRouter.get('/basic', async (req, res, next) => {
  try {
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      const { sipAccount } = person;
      const atSymbol = sipAccount.indexOf('@');
      // the first 4 characters will always be "sip:", so skip past those
      const sipUsername = sipAccount.substring(4, atSymbol);
      const sipHost = sipAccount.substring(atSymbol + 1);
      return res.status(200).json({
        email: person.email,
        phone: person.phoneNum,
        sipUsername,
        sipHost,
        firstName: person.firstName,
        lastName: person.lastName
      });
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

// save user settings
settingsRouter.put('/basic', async (req, res, next) => {
  try {
    if (!req.body.firstName.trim() || !req.body.lastName.trim()) {
      return res.sendStatus(400);
    }
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      let { firstName, lastName } = req.body;
      firstName = firstName.trim();
      lastName = lastName.trim();
      if (person.firstName !== firstName || person.lastName !== lastName) {
        person.firstName = firstName;
        person.lastName = lastName;
        await person.save();
      }
      analytics.event('User', 'Changed Settings').send();
      return res.sendStatus(200);
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

// retrieve user's advanced settings
settingsRouter.get('/advanced', async (req, res, next) => {
  try {
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      return res.status(200).json(JSON.parse(person.prefs));
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

// save user's advanced settings
settingsRouter.put('/advanced', async (req, res, next) => {
  try {
    if (
      Object.entries(req.body).length === 0 &&
      req.body.constructor === Object
    ) {
      return res.sendStatus(400);
    }
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      person.prefs = JSON.stringify(req.body);
      await person.save();
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

// delete user account
settingsRouter.delete('/delete', async (req, res, next) => {
  try {
    if (!req.body.email) {
      return res.sendStatus(400);
    }
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      if (person.email === req.body.email) {
        const confirm = await stripe.customers.del(person.stripeCusId);
        if (confirm) {
          const client = new google.auth.OAuth2();
          client.revokeToken(person.refreshToken);
          await person.remove();
          analytics.event('User', 'Deleted Account').send();
          req.session = null;
          return res.sendStatus(200);
        }
        return res.sendStatus(500);
      }
      return res.sendStatus(400);
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

module.exports = settingsRouter;
