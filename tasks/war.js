/*
 * grunt-war
 * https://github.com/wibobm/grunt-war
 *
 * Copyright (c) 2014 Morriscoding LLC
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {

    'use strict';

    var path = require('path');

    grunt.registerMultiTask('war', 'grunt-war generating war.', function () {

        var archiver = require('archiver');
        var fs = require('fs');

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

        options.war_dist_folder = normalize(options.war_dist_folder);

        try {
            if (!fs.existsSync(options.war_dist_folder)) {
                fs.mkdirSync(options.war_dist_folder);
            }
        } catch (err) {
            grunt.log.error('Unable create directory ' + options.war_dist_folder + '  ' + err);
        }

        try {
            if (fs.existsSync(warName(options))) {
                fs.renameSync(warName(options), warName(options) + '.old');
                fs.unlinkSync(warName(options) + '.old');
            }
        } catch (err) {
            grunt.log.error('Unable remove old ' + warName(options) + '  ' + err);
        }

        var warFileName = warName(options);
        var output = fs.createWriteStream(warFileName);

        var archive = archiver('zip', {
            store: true
        });

        var done = this.async();


        output.on('close', function () {
            log(options, 'grunt-war: (' + warFileName + ') ' + archive.pointer() + ' total bytes');
        });

        output.on('finish', function () {
            done(true);
        })

        archive.on('error', function (err) {
            done(true);
            throw err;
        });

        archive.pipe(output);

        var webxmlExists = false;
        var metaINFExists = false;

        war(archive, options, options.war_extras);

        this.files.forEach(function (each) {
            try {
                var file_name = each.src[0];
                if (!grunt.file.isDir(file_name) && file_name.localeCompare(warFileName) !== 0) {
                    if (!webxmlExists && 'WEB-INF/web.xml'.localeCompare(each.dest) == 0) {
                        webxmlExists = true;
                        log('User supplied WEB-INF/web.xml therefore any webxml options on grunt-war task will be ignored.');
                    }
                    if (!metaINFExists && (/^META-INF/).test(each.dest)) {
                        metaINFExists = true;
                    }
                }
            } catch (err) {
                grunt.log.error('Unable to read file: (' + each.src + ') error: ' + err);
                throw err;
            }
        });

        archive.bulk(this.files);

        if (webxmlExists === false) {
            war(archive, options, [
                {filename: 'WEB-INF/web.xml', data: options.webxml}
            ]);
        }

        if (metaINFExists === false) {
            war(archive, options, [
                {filename: 'META-INF'}
            ]);
        }

        archive.finalize();
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
                    target.append(each.data(opts), {name: each.filename});
                } else {
                    if (each.data === undefined) {
                        target.append(null, {name: normalize(each.filename)});
                    } else {
                        target.append(each.data, {name: each.filename});
                    }
                }
                //log(opts, 'adding ' + each.filename);
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
        return opts.war_dist_folder + opts.war_name + ((/\.war$/).test(opts.war_name) ? '' : '.war');
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

    var indexOfRegEx = function (str, regex) {
        var indexOf = str.search(regex);
        return (indexOf >= 0) ? (indexOf + (0)) : indexOf;
    };
};
