'use strict';

function MockedClient() {
  this.events = {};
}

MockedClient.prototype.on = function (evt, cb) {
  if (!this[evt]) {
    this[evt] = [];
  }

  this[evt].push(cb);

  return this;
};

MockedClient.prototype.emit = function (evt, message) {
  this[evt].forEach(function (cb) {
    cb(message);
  });

  return this;
};

MockedClient.prototype.sftp = function (cb) {
  setTimeout((function () {
    if (!this.fs) {
      this.fs = require('fs');
    }

    cb(null, this.fs);
  }).bind(this), 300);

  return false;
};


MockedClient.prototype.end = function () {
  this.emit('close');
};

MockedClient.prototype.connect = function (config) {
  setTimeout((function () {
    var required = [
        'host',
        'port',
        'username',
        'passphrase',
        'privateKey'
      ],
      isConfigCorrect = required.every(function (prop) {
        return typeof config[prop] !== 'undefined';
      });

    if (!isConfigCorrect) {
      throw new Error('Connection could not be established! Check your configuration params.');
    }

    this.emit('ready');
  }).bind(this), 300);
};

module.exports = MockedClient;
