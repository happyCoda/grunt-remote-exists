/*
 * grunt-remote-exists
 * https://github.com/happyCoda/grunt-remote-exists
 *
 * Copyright (c) 2016 happyCoda
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  grunt.registerMultiTask('remote_exists', 'Check if file exists on remote server', function () {
    var core = {};

    core.userOpts = this.options({
      operation: null,
      connectOpts: null
    });

    core.done = this.async();

    core.extend = function (extendable, from) {
      var prop;

      for (prop in from) {
        if (from.hasOwnProperty(prop)) {
          extendable[prop] = from[prop];
        }
      }

      return extendable;
    };

    core.bindAll = function () {
      var prop;

      for (prop in this) {
        if (this.hasOwnProperty(prop) && typeof this[prop] === 'function') {
          this[prop] = this[prop].bind(this);
        }
      }

      return this;
    };

    core.isFinished = function () {
      var finished = false;

      if (!this.pathMap) {
        grunt.fail.warn('No paths map created!');
      }

      finished = Object.keys(this.pathMap).every(function (key) {
        return this.pathMap[key] === 1;
      }, this);

      return finished;
    };

    core.clearAndOut = function (opts) {

      this.pathMap[opts.filePath] = 1;

      if (this.isFinished()) {
        opts.conn.end();
      }
      
    };

    core.createPathMap = function (paths) {
      this.pathMap = {};

      paths.forEach(function (path) {
        this.pathMap[path] = 0;
      }, this);
    };

    core.init = function () {
      var operation = this.userOpts.operation;

      this.bindAll();

      this.createPathMap(this.sharedOpts.src);

      switch (operation) {
        case 'touch':
          this.touch();
          break;
        case 'rm':
          this.rm();
          break;
        default:
          this.check();
      }


    };

    core.handler = function (opts) {
      var Client = require('ssh2');

      opts.conn = new Client();

      opts.conn
      .on('ready', this.connectionOpenCallBack.bind(this, opts))
      .on('close', opts.connectionCloseCallback.bind(this, opts))
      .connect(opts.connectOpts);

    };

    core.connectionOpenCallBack = function (opts) {
      grunt.log.writeln('Connection :: established');

      opts.conn.sftp(this.sftpCallback.bind(this, opts));
    };

    core.sftpCallback = function (opts, err, sftp) {

      if (err) {

        grunt.fail.warn(err);

      }

      opts.sftp = sftp;

      opts.src.forEach(function (filePath) {
        var currentOpts = Object.create(opts);

        currentOpts.filePath = filePath;

        currentOpts.sftp.exists(currentOpts.filePath, currentOpts.existsCallback.bind(this, currentOpts));

      }, this);
    };

    core.unlinkCallback = function (opts, err) {

      grunt.log.writeln('File ' + opts.filePath + ' has been removed.');

      this.clearAndOut(opts);
    };

    core.wsCloseCallback = function (opts) {

      grunt.log.writeln('File ' + opts.filePath + ' has been created.');

      this.clearAndOut(opts);

    };

    core.connectionCloseCallback = function () {

      grunt.log.writeln('Connection :: closed');

      this.done();

    };

    core.sharedOpts = {
      src: this.data.src,
      connectionCloseCallback: core.connectionCloseCallback
    };

    core.sharedOpts = core.extend(core.sharedOpts, core.userOpts);

    core.check = function () {

      var opts = this.extend({

        existsCallback: function (opts, exists) {

          if (exists) {

            grunt.log.writeln('File ' + opts.filePath + ' exists.');

          } else {

            grunt.log.writeln('File ' + opts.filePath + ' does not exist.');

          }

          this.clearAndOut(opts);

        }

      }, this.sharedOpts);

      this.handler(opts);
    };

    core.touch = function () {

      var opts = this.extend({

        touch: true,

        existsCallback: function (opts, exists) {

          var ws;

          if (exists) {
            grunt.log.writeln('File ' + opts.filePath + ' exists.');

            this.clearAndOut(opts);

          } else {

            grunt.log.writeln('File ' + opts.filePath + ' does not exist.');

            if (opts.touch) {

              ws = opts.sftp.createWriteStream(opts.filePath, {flags: 'w', encoding: 'utf-8', mode: parseInt('0777', 8)});

              ws.on('close', this.wsCloseCallback.bind(this, opts));

              ws.close();

            } else {

              this.clearAndOut(opts);
            }
          }
        }

      }, this.sharedOpts);

      this.handler(opts);
    };

    core.rm = function () {
      var opts = this.extend({

        rm: true,

        existsCallback: function (opts, exists) {

          if (exists) {

            grunt.log.writeln('File ' + opts.filePath + ' exists.');

            if (opts.rm) {

              opts.sftp.unlink(opts.filePath, this.unlinkCallback.bind(this, opts));

            } else {

              this.clearAndOut(opts);
            }

          } else {

            grunt.log.writeln('File ' + opts.filePath + ' does not exist.');

            this.clearAndOut(opts);
          }
        }

      }, this.sharedOpts);

      this.handler(opts);
    };

    core.init();

  });

};
