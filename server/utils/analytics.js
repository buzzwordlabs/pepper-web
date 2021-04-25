const Mixpanel = require('mixpanel');

const ua = require('universal-analytics');

const { REACT_APP_GOOGLE_ANALYTICS_ID, MIXPANEL_TOKEN } = require('../config');

const analytics = ua(REACT_APP_GOOGLE_ANALYTICS_ID);
const mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

class MPCallEvent {
  constructor(initialData) {
    this.eventData = { ...initialData };
  }

  addEventData = async newData => {
    this.eventData = { ...this.eventData, ...newData };
    return this.eventData;
  };

  init = () => {
    return mixpanel.track('call_init', this.eventData);
  };

  gather = () => {
    return mixpanel.track('call_gather', this.eventData);
  };

  safeCall = () => {
    return mixpanel.track('call_safe', this.eventData);
  };

  unknownCall = () => {
    return mixpanel.track('call_unknown', this.eventData);
  };

  addToSafelist = () => {
    return mixpanel.track('call_add_to_safelist', this.eventData);
  };

  redirectVoicemail = () => {
    return mixpanel.track('call_redirect_to_voicemail', this.eventData);
  };

  sentVoicemail = () => {
    return mixpanel.track('call_sent_voicemail', this.eventData);
  };

  hangup = () => {
    return mixpanel.track('call_hangup', this.eventData);
  };

  rejectGeneric = async (error, rejectionReason) => {
    // eslint-disable-next-line no-param-reassign
    if (!rejectionReason) rejectionReason = 'unknown';
    await this.addEventData({
      errorCode: error.code,
      errorMessage: error.message,
      rejectionReason
    });
    mixpanel.track('call_reject_generic', this.eventData);
    return this.hangup();
  };

  rejectInternational = async () => {
    await this.addEventData({ rejectionReason: 'international' });
    mixpanel.track('call_reject_international', this.eventData);
    return this.hangup();
  };

  rejectNoUserFound = async () => {
    await this.addEventData({ rejectionReason: 'noUserFound' });
    mixpanel.track('call_reject_no_user_found', this.eventData);
    return this.hangup();
  };

  rejectPotentialRobot = async () => {
    await this.addEventData({ rejectionReason: 'potentialRobot' });
    mixpanel.track('call_reject_potential_robot', this.eventData);
    return this.hangup();
  };
}

module.exports = { analytics, MPCallEvent };
