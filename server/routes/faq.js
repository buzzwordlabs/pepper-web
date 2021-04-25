const express = require('express');
const { Faq } = require('../models');

const faqRouter = express.Router();

faqRouter.get('/all', async (req, res, next) => {
  try {
    const faq = await Faq.find({}, 'question answer -_id');
    return res.status(200).json({ faq });
  } catch (err) {
    next(err);
  }
});

module.exports = faqRouter;
