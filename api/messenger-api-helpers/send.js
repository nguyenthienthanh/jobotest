// ===== LODASH ================================================================
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';
import textMessage from 'stores/text-messages';

// ===== MESSENGER =============================================================
import api from './api';
import messages from './messages';

// ===== STORES ================================================================
import UserStore from 'stores/user_store';

// Turns typing indicator on.
const typingOn = (recipientId) => {
  return {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_on', // eslint-disable-line camelcase
  };
};

// Turns typing indicator off.
const typingOff = (recipientId) => {
  return {
    recipient: {
      id: recipientId,
    },
    sender_action: 'typing_off', // eslint-disable-line camelcase
  };
};

// Wraps a message json object with recipient information.
const messageToJSON = (recipientId, messagePayload) => {
  return {
    recipient: {
      id: recipientId,
    },
    message: messagePayload,
  };
};

// Send one or more messages using the Send API.
const sendMessage = (recipientId, messagePayloads) => {
  const messagePayloadArray = castArray(messagePayloads)
    .map((messagePayload) => messageToJSON(recipientId, messagePayload));

  api.callMessagesAPI(
    [
      typingOn(recipientId),
      ...messagePayloadArray,
      typingOff(recipientId),
    ]);
};

// Send a welcome message for a non signed-in user.
const sendLoggedOutWelcomeMessage = (recipientId) => {
  sendMessage(
    recipientId, [
      messages.signOutSuccessMessage,
    ]
  );
};

// Send a welcome message for a non signed-in user.
const sendGetStartWelcomeMessage = (recipientId) => {
  sendMessage(
    recipientId, [{
        text: textMessage.welcome,
      },
      message.createAccountMessage,
    ]
  );
};
// Send a welcome message for a signed in user.
const sendLoggedInWelcomeMessage = (recipientId, username) => {
  sendMessage(
    recipientId, [
      messages.loggedInMessage(username),
    ]);
};

// Send a different Welcome message based on if the user is logged in.
const sendReturnMessage = (recipientId) => {
  sendMessage(
    recipientId, [
      messages.napMessage
    ]);
  UserStore.getByMessengerId(recipientId)
    .then(userProfile => {
      if (!isEmpty(userProfile)) {
        sendLoggedInWelcomeMessage(recipientId, userProfile.name);
      } else {
        sendLoggedOutWelcomeMessage(recipientId);
      }
    });
};

const sendWelcomeMessage = (recipientId) => {
  sendGetStartWelcomeMessage(recipientId);
};

// Send a successfully signed in message.
const sendSignOutSuccessMessage = (recipientId) =>
  sendMessage(recipientId, messages.signOutSuccessMessage);

// Send a successfully signed out message.
const sendSignInSuccessMessage = (recipientId, username) => {
  sendMessage(
    recipientId, [
      messages.signInGreetingMessage(username),
      messages.signInSuccessMessage,
    ]);
};

// Send a read receipt to indicate the message has been read
const sendReadReceipt = (recipientId) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    sender_action: 'mark_seen', // eslint-disable-line camelcase
  };

  api.callMessagesAPI(messageData);
};

export default {
  sendMessage,
  sendWelcomeMessage,
  sendReturnMessage,
  sendSignOutSuccessMessage,
  sendSignInSuccessMessage,
  sendReadReceipt,
};