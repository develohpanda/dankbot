'use strict';
var fs = require('fs');
var config = require('./config.json');

function toJSONLocal (date) {
    var local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toJSON();
}

var trace = function(message) {
    if(!config.logToFile) {
        console.log(message);
    }

    if(config.isLoggingEnabled && config.logToFile) {
        let sep = '--------------------';
        let nl = '\r\n';
        message = `${nl}${sep}${nl}timestamp:${toJSONLocal(new Date())}${nl}message:${message}${nl}`;
        fs.appendFile('log.txt', message, function (err) {
          if(err) {
              console.log(`There was an error attempting to log, see stack for details. ${err}. Message attempting to log: ${message}`);
          }
        });
    }
}

var logError = function(error, message) {
    let nl = '\r\n';
    let sep = '--------------------';
    message = `message:${message}${nl}`;
    if(!message) {
        message = '';
    }

    message = `${nl}${sep}${nl}timestamp:${toJSONLocal(new Date())}${nl}name:${error.name}${nl}${message}${error.stack}${nl}${error.message}${nl}${sep}${nl}`;

    trace(message);
}

module.exports.trace = trace;
module.exports.logError = logError;
