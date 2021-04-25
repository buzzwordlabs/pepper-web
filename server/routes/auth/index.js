const express = require('express');

const authRouter = express.Router();
const google = require('./gauth');

authRouter.use('/google', google);

module.exports = authRouter;
