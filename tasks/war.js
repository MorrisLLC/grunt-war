/*
 * grunt-war
 * https://github.com/wibobm/grunt-war
 *
 * Copyright (c) 2013 Morriscoding LLC
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {

    'use strict';

    var path = require('path');
    var zip = require('node-zip')();
    var fs = require('fs');

    grunt.registerMultiTask('war', 'All your war are belong to us.', function () {

        var options = this.options({
            war_compression: 'DEFLATE',
            war_dist_folder: 'test',
            war_filename: 'test',
            war_verbose: false,
            webxml: webXML,
            webxml_welcome: 'index.html',
            webxml_display_name: 'Grunt War Archive',
            webxml_schema_location: 'http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd',
            webxml_version: '3.0',
            webxml_mime_mapping: []
        });

        try {
            fs.unlinkSync(warName(options));
        } catch (err) {
            // ...
        }

        try {
            zip.folder('META-INF');
        } catch (err) {
            grunt.log.writeln('Unable to generate folder META-INF: ' + err);
        }

        try {
            zip.file('WEB-INF/web.xml', webXML(options));
            if (options.war_verbose) {
                grunt.log.writeln('Generated web.xml');
            }
        } catch (err) {
            grunt.log.writeln('Unable to generate web.xml: ' + err);
        }

        this.files.forEach(function (f) {
            try {
                var file_name = f.src[0];
                if (!grunt.file.isDir(file_name)) {
                    var start = file_name.indexOf(path.sep) + 1;
                    var data = fs.readFileSync(file_name, 'binary');
                    var zip_entry = (file_name).substring(start);

                    zip.file(zip_entry, data);

                    if (options.war_verbose) {
                        grunt.log.writeln('adding: "' + file_name);
                    }
                }
            } catch (err) {
                grunt.log.writeln('Unable to read file: (' + f.src + ') error: ' + err);
            }
        });

        try {
            if (options.war_verbose) {
                grunt.log.writeln('Generating war');
            }

            var data = zip.generate({type: 'nodebuffer', compression: options.war_compression});
            fs.writeFileSync(warName(options), data, 'binary');

        } catch (err) {
            grunt.log.writeln('Error creating war: ' + err);
        }
    });

    var warName = function (opts) {
        var name = '';
        if (/\/$/.test(opts.war_dist_folder) || /\\$/.test(opts.war_dist_folder)) {
            name = opts.war_dist_folder + opts.war_filename;
        } else {
            name = opts.war_dist_folder + path.sep + opts.war_filename;
        }
        if (!/war$/.test(name)) {
            name += '.war';
        }
        return name;
    };


    var webXML = function (opts) {
        var xml;

        xml = '<web-app version="' + opts.webxml_version + '" xmlns="http://java.sun.com/xml/ns/javaee"\n';
        xml += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n';
        xml += ' xsi:schemaLocation="' + opts.webxml_schema_location + '">\n';
        xml += '<display-name>' + opts.webxml_display_name + '</display-name>\n';
        xml += '<welcome-file-list>\n<welcome-file>' + opts.webxml_welcome + '</welcome-file>\n</welcome-file-list>\n';

        if (opts.webxml_mime_mapping) {
            opts.webxml_mime_mapping.forEach(function (mime_map) {
                xml += '<mime-mapping>';
                xml += '<extension>' + mime_map.extension + '</extension>';
                xml += '<mime-type>' + mime_map.mime_type + '</mime-type>';
                xml += '</mime-mapping>\n';
            });
        }

        xml += '</web-app>\n';

        return xml;

    };
};
