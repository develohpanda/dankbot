'use strict';
const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const logger = require('./lib/logger.js');
const player = require('./lib/player.js');
const file = require('./lib/file.js');
const tts = require('./lib/tts.js');
const message = require('./lib/message.js');

const bot = new Discord.Client({
    autoReconnect: true
});
const triggerPrefix = config.commandTrigger + config.botPrefix + ' ';

var stats, savedTts, intro;
var commands = new Map();

commands.set(new RegExp(triggerPrefix + 'help', 'i'), ['function',
    message.displayCommands
]);
commands.set(new RegExp(triggerPrefix + 'random', 'i'), ['function',
    player.playRandomSound
]);
commands.set(new RegExp(triggerPrefix + 'tts', 'i'), ['function',
    tts.saveTts
]);
commands.set(new RegExp(triggerPrefix + 'exit', 'i'), ['function',
    leaveVoiceChannel
]);
commands.set(new RegExp(triggerPrefix + 'game', 'i'), ['function',
    message.letsPlay
]);

function addSoundsTo(map, fromDirectoryPath) {
    var soundFiles = fs.readdir(fromDirectoryPath, function(err, files) {
        files.forEach(function(file) {
            if (file[0] !== '.') {
                var command = config.commandTrigger + file.split('.')[0].split('-').join(' ');
                var commandRegExp = new RegExp(command, 'i');
                map.set(commandRegExp, ['sound', file]);
            }
        });
    });
}

function tryMe(fn, msg) {
    if (!msg) {
        msg = '';
    }
    try {
        fn();
    } catch (error) {
        logger.logError(error, `an unhandled exception occured. ${msg}`);
    }
}

function leaveVoiceChannel(message) {
    if (bot.voiceConnections.get('server', message.server)) {
        bot.voiceConnections.get('server', message.server).destroy();
    }
}

bot.on('message', function(message) {
    tryMe(function() {
        message.messageHandler(message)
    });
});

bot.on('voiceStateUpdate', function(oldUser, newUser) {

    tryMe(function() {
        message.introSounds(newUser.voiceChannel, newUser);
    });
});

function loadStatsFile() {
    file.loadFile(config.statsFileName, {}, function(data) {
        stats = data;
    });
}

function loadIntros() {
    file.loadFile(config.introFileName, [], function(data) {
        intro = data;
    });
}

function loadTtsFile() {
    console.log(`Loading tts commands...`);
    file.loadFile(config.ttsFileName, [], function(data){
        savedTts = data;
        savedTts.forEach(function(element, index, array) {
            var reg = new RegExp(`!${element.cmd}`, 'i');
            commands.set(reg, ['text', element.content]);
        });
        if(savedTts.length > 0) {
            console.log(`Completed loading ${savedTts.length} tts command(s)`);
        } else {
            console.log(`There are currently no stored tts commands.`);
        }
    });
}

(function init() {
    bot.on('error', e => {
        logger.logError(e);
    });

    file.readSoundFiles(function(cmds) {
        commands = new Map([...cmds, ...commands]);

        if (config.autoLoadSounds) {
            addSoundsTo(commands, config.soundPath);
        }
    })
    bot.login(config.botToken);
    
    file.loadFile(config.statsFileName, {}, function(data) {
        stats = data;
    });
    loadStatsFile();
    loadTtsFile();
    loadIntros();
})();