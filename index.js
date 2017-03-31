var Alana = require('@alana/core');
var Request = require('request-promise');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

global._ = _;
global.messageType  = Alana.MessageTypes;

const theBot = new Alana.default();
global.bot = theBot;
global.request = Request;
global.addGreeting = theBot.addGreeting.bind(theBot);
global.newScript = theBot.newScript.bind(theBot);
global.getScript = theBot.getScript.bind(theBot);

/*** Turn on debug logs  ***/
theBot.turnOnDebug();

function extension(element) {
  var extName = path.extname(element);
  return extName === '.js';
};
var listing = fs.readdirSync('./scripts');
listing
  .filter(extension)
  .map(file => path.join(process.cwd(),'scripts', file))
  .forEach(file => {
    require(file);
  });

/*** Add FB as a platform ***/
var FB = require('@alana/platform-facebook').default;
var fb = new FB(bot, process.env.PORT || 3000, 'ACCESS_TOKEN', '/webhook', 'verify_my_voice');

bot.start();
