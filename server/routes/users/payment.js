const express = require('express');

const paymentsRouter = express.Router();
const stripe = require('stripe')(
  process.env.NODE_ENV !== 'production'
    ? process.env.STRIPE_TEST_SECRET_KEY
    : process.env.STRIPE_LIVE_SECRET_KEY
);
const { Person } = require('../../models');
const jwt = require('./jwt');
const { analytics } = require('../../utils');

const plans =
  process.env.NODE_ENV !== 'production'
    ? [
        'plan_FXuKIeuS84UJxz',
        'plan_FXuLAxM5elQY8Z',
        'plan_FXuLeQRJpVV9Ji',
        'plan_FXuMLzd5ycgfkf'
      ]
    : [
        'plan_FXuc9IZb8f8bKi',
        'plan_FXucB8iwFIBCiz',
        'plan_FXucbQX5JKcvX9',
        'plan_FXucjkZUwM8gcT'
      ];
// setup payment
paymentsRouter.post('/create', async (req, res, next) => {
  try {
    if (
      !req.body.stripeToken ||
      !Number.isInteger(req.body.planNum) ||
      req.body.planNum < 0 ||
      req.body.planNum > plans.length - 1 ||
      !req.body.onboardingStep
    ) {
      return res.sendStatus(400);
    }
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      const customer = await stripe.customers.create({
        source: req.body.stripeToken,
        email: person.email,
        plan: plans[req.body.planNum]
      });
      if (customer) {
        person.stripeCusId = customer.id;
        person.stripeSubId = customer.subscriptions.data[0].id;
        person.stripeSubItemId =
          customer.subscriptions.data[0].items.data[0].id;
        person.stripeTierNum = req.body.planNum;
        person.onboardingStep = req.body.onboardingStep + 1;
        await person.save();
        analytics.event('Onboarding', 'Completed Payment').send();
        const newJWT = await jwt.create(person.onboardingStep);
        req.session.onboardingStep = person.onboardingStep;
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

paymentsRouter.put('/change', async (req, res, next) => {
  try {
    if (
      !Number.isInteger(req.body.newTier) ||
      req.body.newTier < 0 ||
      req.body.newTier > plans.length - 1
    ) {
      return res.sendStatus(400);
    }
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      const updatedSubscription = await stripe.subscriptions.update(
        person.stripeSubId,
        {
          cancel_at_period_end: false,
          items: [
            {
              id: person.stripeSubItemId,
              plan: plans[req.body.newTier]
            }
          ]
        }
      );
      if (updatedSubscription) {
        person.stripeSubId = updatedSubscription.id;
        person.stripeSubItemId = updatedSubscription.items.data[0].id;
        person.stripeTierNum = req.body.newTier;
        await person.save();
        analytics.event('Payment', 'Changed Subscription').send();
        return res.sendStatus(200);
      }
      return res.sendStatus(500);
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.put('/update-card', async (req, res, next) => {
  try {
    if (!req.body.stripeToken) {
      return res.sendStatus(400);
    }
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      const updatedCard = await stripe.customers.update(person.stripeCusId, {
        source: req.body.stripeToken
      });
      if (updatedCard) {
        analytics.event('Payment', 'Updated Card').send();
        return res.sendStatus(200);
      }
      return res.sendStatus(500);
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.delete('/cancel', async (req, res, next) => {
  try {
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      const cancel = await stripe.subscriptions.del(person.stripeSubId, {
        prorate: true
      });
      if (cancel) {
        person.stripeSubId = undefined;
        person.stripeSubItemId = undefined;
        person.stripeTierNum = undefined;
        await person.save();
        analytics.event('Payment', 'Canceled Subscription').send();
        return res.sendStatus(200);
      }
      return res.sendStatus(500);
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.post('/resubscribe', async (req, res, next) => {
  try {
    if (
      !Number.isInteger(req.body.newTier) ||
      req.body.newTier < 0 ||
      req.body.newTier > plans.length - 1
    ) {
      return res.sendStatus(400);
    }
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      const newSubscription = await stripe.subscriptions.create({
        customer: person.stripeCusId,
        plan: plans[req.body.newTier]
      });
      if (newSubscription) {
        person.stripeSubId = newSubscription.id;
        person.stripeSubItemId = newSubscription.items.data[0].id;
        person.stripeTierNum = req.body.newTier;
        analytics.event('Payment', 'Resubscribed').send();
        await person.save();
        return res.sendStatus(200);
      }
      return res.sendStatus(500);
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get('/current', async (req, res, next) => {
  try {
    const person = await Person.findById(req.session.id).exec();
    if (person) {
      if (
        !Number.isInteger(person.stripeTierNum) ||
        person.stripeTierNum < 0 ||
        person.stripeTierNum > plans.length - 1
      ) {
        return res.status(200).json({ currentTier: -1 });
      }
      return res.status(200).json({ currentTier: person.stripeTierNum });
    }
    req.session = null;
    return res.sendStatus(401);
  } catch (err) {
    next(err);
  }
});

module.exports = paymentsRouter;
