'use strict';

const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');
const createStateHandler = Alexa.CreateStateHandler;


var iotdata = new AWS.IotData({ endpoint: 'abcxyz123.iot.us-east-1.amazonaws.com' }); // change to your AWS IOT endpoint
const TOPIC_AWS_IOT = "aws/light/control/";

const SKILL_NAME = 'light controller'; // TODO Be sure to change this for your skill.

const SKILL_STATES = {
    COMMAND: '_COMMANDMODE', // command.
    START: '_STARTMODE', // Entry point, start conversation.
    HELP: '_HELPMODE', // The user is asking for help.
};

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL)
var slots = null;


function PublishMessage(topic, payload, qos, callback) {
    var params = {
        topic: topic,
        payload: payload,
        qos: qos
    };
    iotdata.publish(params, (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("success?");
        }
        callback()
    });
}

exports.handler = (event, context) => {
    if (event.request.hasOwnProperty('intent')) {
        slots = event.request.intent.slots;
    }
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startStateHandlers, commandStateHandlers, helpStateHandlers);
    alexa.APP_ID = APP_ID;
    alexa.execute();
};

const newSessionHandlers = {
    /**
     * Entry point. Start a new conversation on new session. Handle any setup logic here.
     */
    'NewSession': function () {
        this.handler.state = SKILL_STATES.START;
        if (this.event.request.type === 'LaunchRequest') {
            // LaunchRequest: Sent when the user invokes your skill without providing a specific intent.
            this.emitWithState('StartConversation', true);
        } else if (this.event.request.type === 'IntentRequest') {
            // IntentRequest: Sent when the user makes a request that corresponds to one of the intents defined in your intent schema.
            console.log(`current intent: ${this.event.request.intent.name
                }, current state:${this.handler.state}`);
            const intent = this.event.request.intent.name;
            this.emitWithState(intent);
        }
    },

    'SessionEndedRequest': function () {
        const speechOutput = 'OK, Goodbye!';
        this.emit(':tell', speechOutput);
    },
};


const startStateHandlers = createStateHandler(SKILL_STATES.START, {
    'StartConversation': function (newSesson) {
        let repromptText = `How can i help you? `;
        let speechOutput = repromptText;
        Object.assign(this.attributes, {
            speechOutput: repromptText,
            repromptText,
        });

        // Set the current state to command mode. The skill will now use handlers defined in commandStateHandlers
        this.handler.state = SKILL_STATES.COMMAND;
        this.emit(':askWithCard', speechOutput, repromptText, SKILL_NAME, repromptText);
    },
    'AMAZON.HelpIntent': function () {
        this.handler.state = SKILL_STATES.HELP;
        this.emitWithState('helpTheUser', true);
    },
    'Unhandled': function () {
        this.emit('StartConversation', true);
    },
    'SessionEndedRequest': function () {
        const speechOutput = 'OK, Goodbye!';
        this.emit(':tell', speechOutput);
    },
});


const commandStateHandlers = createStateHandler(SKILL_STATES.COMMAND, {
    'CommandIntent': function () {
        handleUserCommand.call(this);
    },

    'AMAZON.HelpIntent': function () {
        this.handler.state = SKILL_STATES.HELP;
        this.emitWithState('helpTheUser', false);
    },

    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptText);
    },

    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'see you later.');
    },

    'Unhandled': function () {
        const speechOutput = `Try saying a command`;
        this.emit(':ask', speechOutput, speechOutput);
    },

    'SessionEndedRequest': function () {
        const speechOutput = 'OK, Goodbye!';
        this.emit(':tell', speechOutput);
    },
});

function handleUserCommand() {
    let speechOutput = '';
    if (slots != null) {
        console.log(slots)
        var device = slots.device.value.toLowerCase();

        switch (device) {
            case "light":
                let that = this;
                var iot_message;

                var actionpower = slots.actionpower.value;
                if (actionpower === 'on') {
                    iot_message = 'on';
                    speechOutput += `Ok, see your light!`;
                }
                else {
                    iot_message = 'off';
                    speechOutput += `Your light is off`;
                }
                PublishMessage(
                    TOPIC_AWS_IOT,
                    JSON.stringify({
                        'type': 'control',
                        'device': device,
                        'power': actionpower
                    }),
                    1,
                    () => {
                        that.emit(':ask', speechOutput, '');
                    }
                )
                break;
            default:
                break;
        }
    }


}


const helpStateHandlers = createStateHandler(SKILL_STATES.HELP, {
    'helpTheUser': function (newGame) {
        const speechOutput = `Try saying a command, e.g turn on the light.`;
        const repromptText = speechOutput
        this.emit(':ask', speechOutput, repromptText);
        this.handler.state = SKILL_STATES.COMMAND;
    },
    'AMAZON.HelpIntent': function () {
        this.emitWithState('helpTheUser', false);
    },
    'AMAZON.StopIntent': function () {
        const speechOutput = 'See you later';
        this.emit(':tell', speechOutput, speechOutput);
    },
    'AMAZON.CancelIntent': function () {
        this.handler.state = SKILL_STATES.START;
        this.emitWithState('StartConversation');
    },
    'SessionEndedRequest': function () {
        const speechOutput = 'OK, Goodbye!';
        this.emit(':tell', speechOutput);
    },
});
