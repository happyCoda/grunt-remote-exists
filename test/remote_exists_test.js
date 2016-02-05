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

    this.connectOpts = {
      host: null,
      port: null,
      username: 'username',
      passphrase: 'passphrase',
      privateKey: 'privateKey'
    };

    this.handler = function (opts) {
      var Client = require('./mocks/ssh_client_mock');

      opts.conn = new Client();
      opts.assertions = {
        actual: false,
        expected: opts.expected,
      };

      opts.filePath = __dirname + '/tmp/secret.txt';

      opts.test.expect(opts.expect || 1);

      opts.conn.on('ready', function () {

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

    done();
  },

  check: function (test) {

    this.handler({
      test: test,
      expected: true,
      connectOpts: this.connectOpts,
      existsCallback: function (opts, exists) {

        if (exists) {

          opts.assertions.actual = exists;

          opts.conn.end();

        } else {

          opts.assertions.actual = exists;

          opts.conn.end();
        }
      },
      connectionCloseCallback: function (opts) {

        opts.test.equal(opts.assertions.actual, opts.assertions.expected, 'File ' + opts.filePath + ' should exists.');

        opts.test.done();

      }
    });
  },

  touch: function (test) {
    this.handler({
      test: test,
      touch: true,
      connectOpts: this.connectOpts,
      existsCallback: function (opts, exists) {

        var ws;

        if (exists) {

          opts.test.throws(function () { throw new Error('File exists!'); }, Error, 'File ' + opts.filePath + ' should not exists.');

          opts.conn.end();

        } else {

          if (opts.touch) {

            opts.test.doesNotThrow(function () {
              ws = opts.sftp.createWriteStream(opts.filePath, {flags: 'w', encoding: 'utf-8', mode: parseInt('0777', 8)});
            }, 'File ' + opts.filePath + ' should be exists.');

            ws.on('close', function () {

              opts.conn.end();

            });

            ws.close();

          } else {
            opts.test.throws(function () { throw new Error('File does not exists and touch flag is omitted'); }, Error, 'File ' + opts.filePath + ' should not exists.');

            opts.conn.end();
          }
        }
      },
      connectionCloseCallback: function (opts) {

        opts.test.done();

      }
    });
  },

  rm: function (test) {
    this.handler({
      test: test,
      rm: true,
      connectOpts: this.connectOpts,
      existsCallback: function (opts, exists) {

        if (opts.exists) {

          if (opts.rm) {
            opts.test.doesNotThrow(function () {
              opts.sftp.unlink(opts.filePath, function (err) {
                opts.conn.end();
              });
            }, 'File ' + opts.filePath + ' should be exists.');
          } else {
            opts.test.throws(function () { throw new Error('Rm flag omitted!'); }, Error, 'File ' + opts.filePath + ' should not exists.');

            opts.conn.end();
          }

        } else {

          opts.test.throws(function () { throw new Error('File does not exists!'); }, Error, 'File ' + opts.filePath + ' should exists.');

          opts.conn.end();
        }
      },
      connectionCloseCallback: function (opts) {

        opts.test.done();

      }
    });
  }
};
