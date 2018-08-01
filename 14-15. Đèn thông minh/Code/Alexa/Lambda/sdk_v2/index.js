const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');

var iotdata = new AWS.IotData({ endpoint: 'a3ou3k9cjf9l7c.iot.us-east-1.amazonaws.com' }); // change to your AWS IOT endpoint
const TOPIC_AWS_IOT = "aws/light/control/";


function handleUserCommand(handlerInput) {
  const { intent } = handlerInput.requestEnvelope;
  var device = handlerInput.requestEnvelope.request.intent.slots.device.value.toLowerCase();;
  var iot_message = '';
  var speechOutput = '';
  var actionpower = '';
  
  switch (device) {
    case "light":
      actionpower = handlerInput.requestEnvelope.request.intent.slots.actionpower.value.toLowerCase();;
      if (actionpower === 'on') {
        iot_message = 'on';
        speechOutput += `Ok, see your light!`;
      }
      else {
        iot_message = 'off';
        speechOutput += `Your light is off`;
      }
      break;
    default:
      speechOutput += `device is not support`;
      break;
  }

  var params = {
    topic: TOPIC_AWS_IOT,
    payload: JSON.stringify({
      'type': 'control',
      'device': device,
      'power': actionpower
    }),
    qos: 1
  };

  return iotdata.publish(params).promise()
    .then(() => handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse());
}

const LaunchRequest = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'AMAZON.StartOverIntent');
  },
  handle(handlerInput) {
    let repromptText = `How can i help you? `;
    let speechOutput = repromptText;
    return handlerInput.responseBuilder.speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    let speechOutput = `Try saying a command, e.g turn on the light.`;
    let repromptText = speechOutput;
    return handlerInput.responseBuilder.speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const StopIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    let speechOutput = 'See you later';
    return handlerInput.responseBuilder.speak(speechOutput).getResponse();
  },
};

const CommandIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest' && request.intent.name === 'CommandIntent';
  },
  handle(handlerInput) {
    return handleUserCommand(handlerInput)
  },
}

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    let speechOutput = `Try saying a command, e.g turn on the light or stop`;
    let repromptText = speechOutput;
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(repromptText)
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    HelpIntent,
    CommandIntent,
    StopIntent,
    SessionEndedRequest,
    UnhandledIntent
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();