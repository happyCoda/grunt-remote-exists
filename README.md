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
      operation: null,
      connectOpts: {
        host: 'hostname',
        port: 22,
        username: 'username',
        passphrase: 'passphrase',
        privateKey: 'privateKey'
      }
    },
    your_target: {
      src: ['/remote/path/to/file']
    },
  },
});
```

### Options

#### filePath
Type: `String`
Default value: `none`

A path to file on a remote server to check if it exists.

#### operation
Type: `String` of `null`
Default value: `null`

String which tells plugin whether it should create, remove or just check file.

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

#### Write
If `filePath` does not exist, it will be created since `touch` option is enabled. Checking results will be outputted as well.

```js
grunt.initConfig({
  remote_exists: {
    options: {
      operation: 'touch',
      connectOpts: {
        host: 'hostname',
        port: 22,
        username: 'username',
        passphrase: 'passphrase',
        privateKey: 'privateKey'
      }
    },
    default_config: {
      src: ['/remote/path/to/file']
    }
  }
});
```

#### Remove
If `filePath` exists, it will be removed, nothing will be done otherwise. Checking results will be outputted as well.

```js
grunt.initConfig({
  remote_exists: {
    options: {
      operation: 'rm',
      connectOpts: {
        host: 'hostname',
        port: 22,
        username: 'username',
        passphrase: 'passphrase',
        privateKey: 'privateKey'
      }
    },
    default_config: {
      src: ['/remote/path/to/file']
    }
  }
});
```

## Release History
* 2016-02-05   v1.1.0   Tests are rewritten. File removal bug fixed. Multiple file support added.
* 2016-02-04   v1.0.0   All logic completely rewritten.
* 2016-02-03   v0.1.0   First official release.
