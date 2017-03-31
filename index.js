const Alana = require('@alana/core').default;
const request = require('request-promise');
const flatten = require('lodash.flatten');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
// Converts FB payloads to Alana common message format
const inputConverter = require('@alana/platform-facebook').mapFBToInternal;
// Converts alana format to FB messenger
const outputConverter = require('@alana/platform-facebook').mapInternalToFB;

/** change these **/
const ACCESS_TOKEN = 'ACCESS_TOKEN';
const VERIFY_TOKEN = 'verify_my_voice';

exports.runbot = function runbot(req, res) {
  if (req.method === 'GET') {
      console.log('Received a verify request with token', req.query['hub.verify_token']);
      if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        return res.send(req.query['hub.challenge']);
      }
      return res.send('Error, wrong validation token');
  }
  
  const bot = new Alana();
  const global = {
      newScript: bot.newScript.bind(bot),
      addGreeting: bot.addGreeting.bind(bot),
      request: request,
      addErrorHandler: bot.addErrorHandler.bind(bot),
      getScript: bot.getScript.bind(bot),
      _bot: bot,
  };
  var listing = fs.readdirSync('./scripts');
  listing.map(file => path.join(__dirname, 'scripts', file))
    .forEach(file => {
      vm.runInNewContext(fs.readFileSync(file, 'utf8'), global, {
            filename: file,
            displayErrors: true,
        });
    });
  bot.turnOnDebug();
  const platform = new PlatformSnub();
  console.log(platform);
  const messagingEvents = flatten(req.body.entry.map(entry => entry.messaging));
  if (bot.debugOn) {
    console.log(`Recieved ${messagingEvents.length} messages`);
  }
  Promise.each(messagingEvents, (event) => {
    const message = inputConverter(event, 'GET_STARTED_PAYLOAD');
      if (message !== null) {
        const user = {
          _platform: platform,
          id: event.sender.id,
          platform: 'Facebook',
        };
        if (bot.debugOn) {
          console.log(`Processing ${message.type} message for ${user.id}`);
        }
        return bot.processMessage(user, message);
      }
      return Promise.resolve();
    })
      .then(() => {
        // function terminates when each message is processed
        res.sendStatus(200);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
}

// platform snub to respond back 
class PlatformSnub {
  start() {
      return Promise.resolve(this);
  }
  stop() {
      return Promise.resolve(this);
  }
  send(user, message) {
    const fbmessage = outputConverter(message);
    fbmessage.recipient.id = user.id;
    console.log(`sending ${message.type} message to ${user.id}`);
    return request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      method: 'POST',
      qs: {
        access_token: ACCESS_TOKEN,
      },
      json: true,
      body: fbmessage,
    });
  }
}
