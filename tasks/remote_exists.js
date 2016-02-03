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

    var options = this.options({
        filePath: '.',
        touch: false,
        connectOpts: null
      }),
      done = this.async(),
      connectOpts = options.connectOpts,
      filePath = options.filePath,
      touch = options.touch,
      Client = require('ssh2'),
      conn;

    grunt.log.writeln(JSON.stringify(connectOpts));

    conn = new Client();

    conn.on('ready', function () {

      grunt.log.writeln('connection :: established');

      conn.sftp(function (err, sftp) {
        if (err) {

          grunt.fail.warn(err);

        }

        sftp.exists(filePath, function (exists) {
          var ws;

          if (exists) {

            grunt.log.writeln('File ' + filePath + ' exists.');

            conn.end();

          } else {

            grunt.log.writeln('File ' + filePath + ' does not exist.');

            if (touch) {

              ws = sftp.createWriteStream(filePath, {flags: 'w', encoding: 'utf-8', mode: parseInt('0777', 8)});

              ws.on('close', function () {

                grunt.log.writeln('File ' + filePath + ' has been created.');

                conn.end();

              });

              ws.close();
            }
          }
        });
      });
    }).on('close', function () {

      grunt.log.writeln('connection :: closed');

      done();

    }).connect(connectOpts);
  });

};
