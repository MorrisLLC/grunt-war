# grunt-war

> Pure JavaScript implementation for creating a WAR of your project for deployment on a JVM servlet container. 

## Getting Started
This plugin requires Grunt `~0.4.2`

```shell
npm install grunt-war --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-war');
```

## The "war" task

### Overview
In your project's Gruntfile, add a section named `war` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({

      /*
       * Build a WAR (web archive) without Maven or the JVM installed.
       */
      war: {
        target: {
          options: {
            war_verbose: true,
            war_compression: 'DEFLATE', // choices are 'NONE' or 'DEFLATE'.
            war_output_folder: 'war',          // Folder needs to exist.
            war_filename: 'webmagic',   // .war will be appended automatically if extension is omitted.
            webxml_welcome: 'index.html',
            webxml_display_name: 'Web Magic',
            webxml_mime_mapping: [
                { extension: 'woff', mime_type: 'application/font-woff' }
              ]
          },
          files: [
            {
              expand: true,
              src: ['<%= build_dir %>/**'],
              dest: 'war/'
            }
          ]
        }
      }
});
```

### Options

#### options.war_verbose
Type: `Boolean`
Default value: `false`

Logs progress to the grunt console log.

#### options.war_compression
Type: `war_compression`
Default value: `'DEFLATE'`

Compress ('DEFLATE') or leave uncompressed ('NONE').

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
