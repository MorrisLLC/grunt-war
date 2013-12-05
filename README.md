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
            war_dist_folder: '<%= build_dir %>',
            war_verbose: true,
            war_name: 'webmagic',
            war_extras: [{filename: 'grunt-war-credits.txt', data: 'Thank you @wibobm!\n'}],
            webxml_welcome: 'index.html',
            webxml_display_name: 'Web Magic',
            webxml_mime_mapping: [
                { extension: 'woff', mime_type: 'application/font-woff' }
              ]
          },
          files: [
            {
              expand: true,
              src: ['<%= build_dir %>/**']
            }
          ]
        }
      }
});
```

### Options

#### options.war_dist_folder
Type: `'string'`
Default value: `'test'`

This is the folder that the war will be placed. This folder has to exist before this task is run.

#### options.war_name
Type: `'string'`
Default value: `'grunt'`

#### options.war_extras
Type: `'Array'`
Default value: `[]`

A list of files and folders entries that are to be included in the war. Each object in the array has
keys `filename` and `data` example: `{ filename: 'name_of_file.ext', data: file_data }`.  If the key `data`
is omitted then an empty folder called `filename` will be added to the WAR. The value of key  `data` can
either be a `string` or a function that returns a `string`.

#### options.war_verbose
Type: `'boolean'`
Default value: `false`

Logs progress to the grunt console log.

#### options.war_compression
Type: `'string'`
Default value: `'DEFLATE'`

Compress ('DEFLATE') or leave uncompressed ('NONE').

#### options.webxml_welcome
Type: `'string'`
Default value: `'index.html'`

#### options.webxml_display_name
Type: `'string'`
Default value: `'Grunt WAR'`

#### options.webxml_webapp_extras
Type: `'Array'`
Default value: `[]`

#### options.webxml_mime_mapping
Type: `'Array'`
Default value: `[]`

An array of objects with properties `extension` and `mime_type`.

#### options.webxml_webapp_extras
Type: `'Array'`
Default value: `[]`

An array of objects that are either `'string'` or `'function'` that return `'string'`.  These entries are
included directly into the generated web.xml.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

#### 0.2.0

* Renamed `options.war_filename` to `options.war_name`.
* Added `options.war_extras`
* Added `options.webxml_webapp_extras`.

#### 0.1.4 Initial
