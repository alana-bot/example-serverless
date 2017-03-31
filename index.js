const Alana = require('@alana/core').default;
const request = require('request-promise');
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
  bot.debugOn();
  const platform = new PlatformSnub();
  const message = inputConverter(req.body);
  if (message !== null) {
    const user = {
      _platform: this,
      id: event.sender.id,
      platform: 'Facebook',
    };
    if (bot.debugOn) {
      console.log(`Processing ${message.type} message for ${user.id}`);
    }
    bot.processMessage(user, message)
      .then(() => {
        // function terminates when a response is sent
        res.sendStatus(200);
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  }
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
