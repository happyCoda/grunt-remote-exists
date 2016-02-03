# grunt-remote-exists

> Check if file exists on remote server

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-remote-exists --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-remote-exists');
```

## The "remote_exists" task

### Overview
In your project's Gruntfile, add a section named `remote_exists` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  remote_exists: {
    options: {
      filePath: '.',
      touch: false,
      connectOpts: {
        host: 'hostname',
        port: 22,
        username: 'username',
        passphrase: 'passphrase',
        privateKey: 'privateKey'
      }
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### filePath
Type: `String`
Default value: `'.'`

A path to file on a remote server to check if it exists.

#### touch
Type: `Boolean`
Default value: `false`

Boolean flag which tells plugin whether it should create file or not.

#### connectOpts
Type: `Object` of `null`
Default value: `null`

An object with ssh connection params.

### Usage Examples

#### Just checking
In this example, the default options for file creation are used. So the file specified in `filePath` will be checked on the remote `host`, and result of this checking will be outputted to the console.

```js
grunt.initConfig({
  remote_exists: {
    options: {
      filePath: '/remote/path/to/file',
      connectOpts: {
        host: 'hostname',
        port: 22,
        username: 'username',
        passphrase: 'passphrase',
        privateKey: 'privateKey'
      }
    }
  }
});
```

#### Check and write
If `filePath` does not exist, it will be created since `touch` option is enabled. Checking results will be outputted as well.

```js
grunt.initConfig({
  remote_exists: {
    options: {
      filePath: '/remote/path/to/file',
      touch: true,
      connectOpts: {
        host: 'hostname',
        port: 22,
        username: 'username',
        passphrase: 'passphrase',
        privateKey: 'privateKey'
      }
    }
  }
});
```

## Release History
_(Nothing yet)_
