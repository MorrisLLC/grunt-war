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
    var fs = require('fs');

    grunt.registerMultiTask('war', 'grunt-war generating war.', function () {

        var zip = require('node-zip')();
        var options = this.options({
            war_dist_folder: 'test',
            war_name: 'grunt',
            war_compression: 'DEFLATE',
            war_verbose: false,
            war_extras: [],
            webxml: webXML,
            webxml_welcome: 'index.html',
            webxml_display_name: 'Grunt WAR',
            webxml_webapp_version: '3.0',
            webxml_webapp_xmlns: 'http://java.sun.com/xml/ns/javaee',
            webxml_webapp_xmlns_xsi: 'http://www.w3.org/2001/XMLSchema-instance',
            webxml_webapp_xsi_schema_location: 'http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd',
            webxml_mime_mapping: [],
            webxml_webapp_extras: []
        });

        try {
            if (fs.existsSync(warName(options))) {
                fs.renameSync(warName(options ),warName(options) + '.old');
                fs.unlinkSync(warName(options) + '.old');
            }
        } catch (err) {
            grunt.log.error('Unable remove old ' + warName(options) + '  ' + err);
        }

        war(zip, options, [
            {filename: 'WEB-INF/web.xml', data: webXML},
            {filename: 'META-INF'}
        ]);

        war(zip, options, options.war_extras);

        this.files.forEach(function (each) {
            try {
                var file_name = each.src[0];
                if (!grunt.file.isDir(file_name)) {
                    var src_folder_length = 1 + Math.max(indexOfRegEx(file_name,(/\//)),indexOfRegEx(file_name,(/\\/)));

                    war(zip, options, {
                        filename: (file_name).substring(src_folder_length),
                        data: fs.readFileSync(file_name, 'binary')
                    });
                }
            } catch (err) {
                grunt.log.error('Unable to read file: (' + each.src + ') error: ' + err);
                throw err;
            }
        });


        try {
            log(options, 'Generating ' + warName(options));
            var data = zip.generate({type: 'nodebuffer', compression: options.war_compression});
            fs.writeFileSync(warName(options), data, 'binary');
        } catch (err) {
            grunt.log.error('Error creating war: ' + err);
            throw err;
        }
    });

    var webXML = function (opts) {
        var xml;

        xml = '<web-app';
        xml += ' version="' + opts.webxml_webapp_version + '"';
        xml += ' xmlns="' + opts.webxml_webapp_xmlns + '"';
        xml += ' xmlns:xsi="' + opts.webxml_webapp_xmlns_xsi + '"';
        xml += ' xsi:schemaLocation="' + opts.webxml_webapp_xsi_schema_location + '"';
        xml += '>\n';

        xml += '<display-name>' + opts.webxml_display_name + '</display-name>\n';
        xml += '<welcome-file-list>';
        xml += '<welcome-file>' + opts.webxml_welcome + '</welcome-file>';
        xml += '</welcome-file-list>\n';

        if (opts.webxml_mime_mapping) {
            opts.webxml_mime_mapping.forEach(function (mime_map) {
                xml += '<mime-mapping>';
                xml += '<extension>' + mime_map.extension + '</extension>';
                xml += '<mime-type>' + mime_map.mime_type + '</mime-type>';
                xml += '</mime-mapping>\n';
            });
        }

        if (Array.isArray(opts.webxml_webapp_extras)) {
            opts.webxml_webapp_extras.forEach(function (each) {
                if (typeof each === 'function') {
                    xml += each(opts);
                } else if (typeof each === 'string') {
                    xml += each;
                } else {
                    grunt.log.error('options.webxml_webapp_extras invalid: ' + each);
                }
            });
        }

        xml += '</web-app>\n';

        return xml;
    };

    var war = function (target, opts, extras) {
        if (extras === undefined) {
            return;
        }

        var addEntry = function (each) {
            try {
                if (typeof each.data === 'function') {
                    target.file(each.filename, each.data(opts), {binary:true});
                } else {
                    if (each.data === undefined) {
                        target.folder(each.filename);
                    } else {
                        target.file(each.filename, each.data, {binary:true});
                    }
                }
                log(opts, 'adding ' + each.filename);
            } catch (err) {
                grunt.log.error('Error adding: ' + each + ' to war: ' + err);
                throw err;
            }
        };

        if (Array.isArray(extras)) {
            extras.forEach(addEntry);
        } else if (extras.hasOwnProperty('filename')) {
            addEntry(extras);
        } else {
            grunt.log.error('Invalid format of war_extras element: ' + extras);
        }
    };

    var warName = function (opts) {
        return normalize(opts.war_dist_folder) + opts.war_name + ((/\.war$/).test(opts.war_name) ? '' : '.war');
    };

    var normalize = function (folder) {
        if ((/\/$/).test(folder) || (/\\$/).test(folder)) {
            return folder.substr(0, folder.length - 1) + path.sep;
        }
        return folder + path.sep;
    };

    var log = function (opts, msg) {
        if (opts.war_verbose) {
            grunt.log.writeln(msg);
        } else {
            grunt.log.debug(msg);
        }
    };

    var indexOfRegEx = function(str, regex) {
        var indexOf = str.search(regex);
        return (indexOf >= 0) ? (indexOf + (0)) : indexOf;
    };
};
