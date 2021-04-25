/* eslint-disable no-use-before-define */
const express = require('express');

const gauthRouter = express.Router();
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const { google } = require('googleapis');
const jwt = require('../users/jwt');
const { Person } = require('../../models');
const { logger, analytics } = require('../../utils');

const googleClientId = process.env.REACT_APP_GAUTH_CLIENTID;
const googleClientSecret = process.env.GAUTH_CLIENT_SECRET;
const googleRedirectUri = process.env.GAUTH_REDIRECT_URI;

gauthRouter.post('/', async (req, res, next) => {
  const headers = req.headers.authorization;
  if (!headers) {
    return res.sendStatus(400);
  }
  // retrieve auth code for google verification
  let authCode;
  try {
    authCode = headers.split(' ')[1];
  } catch (error) {
    return res.sendStatus(400);
  }
  // instantiate Google OAuth client
  const client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    googleRedirectUri
  );
  try {
    // use Google people API
    const people = google.people({
      version: 'v1',
      auth: client
    });
    // get tokens from Google
    const tokenResponse = await client.getToken(authCode);
    const { tokens } = tokenResponse;
    // refresh tokens are only given when user approves app for the first time, so register as new user
    if (tokens.refresh_token) {
      client.setCredentials({
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        refresh_token: tokens.refresh_token
      });
      // retrieve user contact info and add to database
      const { data } = await people.people.get({
        resourceName: 'people/me',
        personFields: ['emailAddresses,names']
      });
      // check if google has verified the email
      if (data.emailAddresses[0].metadata.verified) {
        // create new user object and store in database
        const firstName = data.names[0].givenName;
        const lastName = data.names[0].familyName;
        const email = data.emailAddresses[0].value;
        const [
          safelist,
          refreshSyncToken
        ] = await retrieveGoogleContactsPhoneNum(people);
        const personObj = {
          firstName,
          lastName,
          email,
          safelist,
          refreshToken: tokens.refresh_token,
          refreshSyncToken,
          onboardingStep: 1
        };
        const addPerson = new Person(personObj);
        try {
          const newPerson = await addPerson.save();
          analytics.event('User', 'Signed Up').send();
          req.session.id = newPerson.id;
          const onboardingStep = 1;
          const newJWT = await jwt.create(onboardingStep);
          return res.status(200).json({ token: newJWT });
        } catch (error) {
          logger.error(error.stack);
          const MONGOOSE_DUP_ENTRY_ERROR_CODE = 11000;
          if (error.code === MONGOOSE_DUP_ENTRY_ERROR_CODE) {
            const person = await Person.findOne({ email }).exec();
            if (person) {
              analytics.event('User', 'Logged In').send();
              req.session.id = person.id;
              const newJWT = await jwt.create(person.onboardingStep);
              res.status(200).json({ token: newJWT });
              person.refreshToken = tokens.refresh_token;
              const newSafelist = [
                ...new Set(person.safelist.concat(safelist))
              ];
              person.safelist = newSafelist;
              await person.save();
            } else {
              if (client.credentials.refresh_token) {
                client.revokeToken(client.credentials.refresh_token);
              }
              return res.sendStatus(401);
            }
          } else {
            if (client.credentials.refresh_token) {
              client.revokeToken(client.credentials.refresh_token);
            }
            next(error);
          }
        }
      } else {
        return res.sendStatus(500);
      }
    }
    // if user already exists, retrieve contacts and update list
    else {
      client.setCredentials({
        id_token: tokens.id_token,
        access_token: tokens.access_token
      });
      const { data } = await people.people.get({
        resourceName: 'people/me',
        personFields: ['emailAddresses,names']
      });
      if (data.emailAddresses[0].metadata.verified) {
        const person = await Person.findOne({
          email: data.emailAddresses[0].value
        }).exec();
        if (person) {
          analytics.event('User', 'Logged In').send();
          req.session.id = person.id;
          const newJWT = await jwt.create(person.onboardingStep);
          res.status(200).json({ token: newJWT });
          const [
            safelist,
            nextSyncToken
          ] = await retrieveGoogleContactsPhoneNum(people);
          const newSafelist = [...new Set(person.safelist.concat(safelist))];
          person.safelist = newSafelist;
          person.nextSyncToken = nextSyncToken;
          await person.save();
        } else {
          return res.sendStatus(401);
        }
      } else {
        return res.sendStatus(500);
      }
    }
  } catch (err) {
    if (client.credentials.refresh_token) {
      client.revokeToken(client.credentials.refresh_token);
    }
    // HACK: don't send headers twice if contacts sync fails but user creation succeeds
    if (!res.headersSent) next(err);
    else logger.error(err.stack || err.message || err);
  }
});

const retrieveGoogleContactsPhoneNum = async (
  people,
  refreshSyncToken = null
) => {
  // parameters to pass Google API as defined by Google API docs
  const listParameters = {
    personFields: 'phoneNumbers',
    resourceName: 'people/me',
    pageSize: 100
  };
  // sync token used to retrieve only the changes instead of all contacts
  if (refreshSyncToken) {
    listParameters.syncToken = refreshSyncToken;
  } else {
    listParameters.requestSyncToken = true;
  }
  // retrieve list of phone numbers and other metadata
  let response;
  try {
    response = await people.people.connections.list(listParameters);
    // sync token was invalid
    if (response.status !== 200) {
      throw new Error('resync');
    }
  } catch (error) {
    delete listParameters.syncToken;
    listParameters.requestSyncToken = true;
    response = await people.people.connections.list(listParameters);
  }
  let {
    data: { connections },
    // eslint-disable-next-line prefer-const
    data: { nextPageToken },
    data: { nextSyncToken }
  } = response;
  // google returns data in pages, so use token to get next page of results
  if (nextPageToken) {
    listParameters.pageToken = nextPageToken;
  }
  // pull out phone numbers
  const connectionPhoneNums = [];
  if (!listParameters.pageToken) {
    if (connections) {
      connections.forEach(personObj => {
        if (personObj.phoneNumbers) {
          personObj.phoneNumbers.forEach(number => {
            if (number.canonicalForm) {
              connectionPhoneNums.push(number.canonicalForm);
            } else if (number.value && !number.canonicalForm) {
              const phoneNumber = parsePhoneNumberFromString(
                number.value,
                'US'
              );
              if (phoneNumber) {
                connectionPhoneNums.push(phoneNumber.number);
              }
            }
          });
        }
      });
    }
  } else {
    while (listParameters.pageToken) {
      if (connections) {
        connections.forEach(personObj => {
          if (personObj.phoneNumbers) {
            personObj.phoneNumbers.forEach(number => {
              if (number.canonicalForm) {
                connectionPhoneNums.push(number.canonicalForm);
              } else if (number.value && !number.canonicalForm) {
                const phoneNumber = parsePhoneNumberFromString(
                  number.value,
                  'US'
                );
                if (phoneNumber) {
                  connectionPhoneNums.push(phoneNumber.number);
                }
              }
            });
          }
        });
        if (listParameters.pageToken) {
          // eslint-disable-next-line no-await-in-loop
          response = await people.people.connections.list(listParameters);
          // eslint-disable-next-line prefer-destructuring
          connections = response.data.connections;
          listParameters.pageToken = response.data.nextPageToken;
          // eslint-disable-next-line prefer-destructuring
          nextSyncToken = response.data.nextSyncToken;
        }
      }
    }
  }
  return [connectionPhoneNums, nextSyncToken];
};
module.exports = gauthRouter;
