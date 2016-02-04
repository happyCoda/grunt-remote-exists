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
      filePath: null,
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

    core.init = function () {
      var operation = this.userOpts.operation;

      this.bindAll();

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

      opts.conn.on('ready', function () {

        grunt.log.writeln('Connection :: established');

        opts.conn.sftp(function (err, sftp) {
          if (err) {

            grunt.fail.warn(err);

          }

          opts.sftp = sftp;

          opts.sftp.exists(opts.filePath, opts.existsCallback.bind(null, opts));

        });
      })
      .on('close', opts.connectionCloseCallback.bind(null, opts))
      .connect(opts.connectOpts);
    };

    core.connectionCloseCallback = function () {

      grunt.log.writeln('Connection :: closed');

      this.done();

    };

    core.check = function () {

      var opts = this.extend({
        existsCallback: function (opts, exists) {

          if (exists) {

            grunt.log.writeln('File ' + opts.filePath + ' exists.');

            opts.conn.end();

          } else {

            grunt.log.writeln('File ' + opts.filePath + ' does not exist.');

            opts.conn.end();
          }
        },

        connectionCloseCallback: this.connectionCloseCallback

      }, this.userOpts);

      this.handler(opts);
    };

    core.touch = function () {

      var opts = this.extend({
        touch: true,
        existsCallback: function (opts, exists) {

          var ws;

          if (exists) {
            grunt.log.writeln('File ' + opts.filePath + ' exists.');

            opts.conn.end();

          } else {

            grunt.log.writeln('File ' + opts.filePath + ' does not exist.');

            if (opts.touch) {

              ws = opts.sftp.createWriteStream(opts.filePath, {flags: 'w', encoding: 'utf-8', mode: parseInt('0777', 8)});

              ws.on('close', function () {

                grunt.log.writeln('File ' + opts.filePath + ' has been created.');

                opts.conn.end();

              });

              ws.close();

            } else {

              opts.conn.end();
            }
          }
        },

        connectionCloseCallback: this.connectionCloseCallback

      }, this.userOpts);

      this.handler(opts);
    };

    core.rm = function () {
      var opts = this.extend({
        rm: true,
        existsCallback: function (opts, exists) {

          if (opts.exists) {

            grunt.log.writeln('File ' + opts.filePath + ' exists.');

            if (opts.rm) {
              opts.sftp.unlink(opts.filePath, function (err) {

                grunt.log.writeln('File ' + opts.filePath + ' has been removed.');

                opts.conn.end();
              });
            } else {

              opts.conn.end();
            }

          } else {

            grunt.log.writeln('File ' + opts.filePath + ' does not exist.');

            opts.conn.end();
          }
        },

        connectionCloseCallback: this.connectionCloseCallback

      }, this.userOpts);

      this.handler(opts);
    };

    core.init();

  });

};
