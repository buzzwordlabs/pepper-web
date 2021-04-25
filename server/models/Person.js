const mongoose = require('mongoose');

const Person = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: {
      type: String,
      unique: true,
      required: true
    },
    phoneNum: {
      type: String,
      unique: true,
      sparse: true
    },
    sipAccount: { type: String },
    prefs: { type: String },
    safelist: [{ type: String }],
    rejectedList: [{ type: String }],
    refreshToken: { type: String },
    refreshSyncToken: { type: String },
    onboardingStep: { type: Number, min: 0, max: 9 },
    stripeCusId: { type: String },
    stripeSubId: { type: String },
    stripeSubItemId: { type: String },
    stripeTierNum: { type: Number, min: 0, max: 3 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Person', Person);
