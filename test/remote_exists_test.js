'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.remote_exists = {
  setUp: function (done) {
    // setup here if necessary
    done();
  },

  custom_options: function (test) {
    var connectOpts = null,
      filePath = '.',
      touch = false,
      Client = require('ssh2'),
      conn,
      actual,
      expected = true;

    conn = new Client();

    test.expect(1);

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

            actual = exists;

            conn.end();

          } else {

            grunt.log.writeln('File ' + filePath + ' does not exist.');

            if (touch) {

              ws = sftp.createWriteStream(filePath, {flags: 'w', encoding: 'utf-8', mode: parseInt('0777', 8)});

              ws.on('close', function () {

                grunt.log.writeln('File ' + filePath + ' has been created.');

                sftp.exists(filePath, function (exists) {
                  actual = exists;

                  conn.end();
                });

              });

              ws.close();

            }
          }
        });
      });
    }).on('close', function () {

      test.equal(actual, expected, 'File ' + filePath + ' should be exists.');

      test.done();

      grunt.log.writeln('connection :: closed');

    }).connect(connectOpts);
  }
};
