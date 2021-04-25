const express = require('express');
const cookieSession = require('cookie-session');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
const Keygrip = require('keygrip');
const morgan = require('morgan');
const sslRedirect = require('heroku-ssl-redirect');
const { logger } = require('./utils');
const { call, auth, user, contact, faq } = require('./routes');

const mongooseURL = process.env.MONGODB_URI;
mongoose.connect(mongooseURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});
const db = mongoose.connection;

db.on('error', err => {
  if (err) {
    logger.error(err.stack);
  }
});

// Assumes that the process is exiting normally
function exiting() {
  db.close(() => {
    process.exit(0);
  });
}
process.on('SIGINT', exiting);
process.on('SIGHUP', exiting);
process.on('SIGTERM', exiting);
process.on('unhandledRejection', (reason, promise) => {
  console.error(`Unhandled Rejection at:', ${promise}\n, 'reason:', ${reason}`);
  process.exit(1);
});
process.on('uncaughtException', (err, origin) => {
  console.error(`Caught Exception ${err}\n Exception Origin: ${origin}`);
  process.exit(1);
});

const app = express();
app.set('trust proxy', 1);
app.use(sslRedirect());
app.use(compression());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());
app.use(helmet());
app.use(
  cookieSession({
    name: 'session',
    keys: new Keygrip(
      [process.env.COOKIE_SECRET_ONE, process.env.COOKIE_SECRET_TWO],
      'sha256',
      'base64'
    ),
    maxAge: 60 * 60 * 2000,
    sameSite: true,
    secure: process.env.NODE_ENV === 'production'
  })
);
app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'combined'));

// Make website static while working on mobile app
// app.use('/call', call);
// app.use('/auth', auth);
// app.use('/user', user);
app.use('/contact', contact);
app.use('/faq', faq);
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.listen(process.env.PORT || 8000, () => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`Listening on PORT ${process.env.PORT || 8000}...`);
  }
});
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});
// error handler, express expects 4 parameters
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message || err);
  return res.sendStatus(500);
});
