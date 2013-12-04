/*
 * grunt-war
 * https://github.com/wibobm/grunt-war
 *
 * Copyright (c) 2013 Morriscoding LLC
 * Licensed under the MIT license.
 */

module.exports = function ( grunt ) {

    'use strict';

    var path = require( 'path' );
    var zip = require( 'node-zip' )();
    var fs = require( 'fs' );

    grunt.registerMultiTask( 'war', 'All your war are belong to us.', function () {

        var options = this.options( {
            war_dist_folder: 'test',
            war_name: 'grunt',
            war_compression: 'DEFLATE',
            war_verbose: false,
            webxml: webXML,
            webxml_welcome: 'index.html',
            webxml_display_name: 'Grunt WAR',
            webxml_webapp_version: '3.0',
            webxml_webapp_xmlns: 'http://java.sun.com/xml/ns/javaee',
            webxml_webapp_xmlns_xsi: 'http://www.w3.org/2001/XMLSchema-instance',
            webxml_webapp_xsi_schema_location: 'http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd',
            webxml_mime_mapping: []
        } );

        try {
            fs.unlinkSync( warName( options ) );
        } catch ( err ) {
            // ...
        }

        try {
            zip.folder( 'META-INF' );
        } catch ( err ) {
            grunt.log.writeln( 'Unable to generate folder META-INF: ' + err );
        }

        try {
            zip.file( 'WEB-INF/web.xml', webXML( options ) );
            if ( options.war_verbose ) {
                grunt.log.writeln( 'Generated web.xml' );
            }
        } catch ( err ) {
            grunt.log.writeln( 'Unable to generate web.xml: ' + err );
        }

        var preamble_length = options.war_dist_folder.length + 1;
        if ( /\/$/.test( options.war_dist_folder ) || /\\$/.test( options.war_dist_folder ) ) {
            preamble_length -= 1;
        }

        this.files.forEach( function ( f ) {
            try {
                var file_name = f.src[0];
                if ( !grunt.file.isDir( file_name ) ) {
                    var data = fs.readFileSync( file_name, 'binary' );
                    var zip_entry = (file_name).substring( preamble_length );

                    zip.file( zip_entry, data );

                    if ( options.war_verbose ) {
                        grunt.log.writeln( 'adding: "' + file_name );
                    }
                }
            } catch ( err ) {
                grunt.log.writeln( 'Unable to read file: (' + f.src + ') error: ' + err );
            }
        } );

        try {
            if ( options.war_verbose ) {
                grunt.log.writeln( 'Generating war' );
            }

            var data = zip.generate( {type: 'nodebuffer', compression: options.war_compression} );
            fs.writeFileSync( warName( options ), data, 'binary' );

        } catch ( err ) {
            grunt.log.writeln( 'Error creating war: ' + err );
        }
    } );

    var warName = function ( opts ) {
        var name = '';
        if ( /\/$/.test( opts.war_dist_folder ) || /\\$/.test( opts.war_dist_folder ) ) {
            name = opts.war_dist_folder + opts.war_name;
        } else {
            name = opts.war_dist_folder + path.sep + opts.war_name;
        }
        if ( !/war$/.test( name ) ) {
            name += '.war';
        }
        return name;
    };


    var webXML = function ( opts ) {
        var xml;

        xml = '<web-app';
        xml += ' version="' + opts.webxml_webapp_version + '"';
        xml += ' xmlns="' + opts.xmlns + '"';
        xml += ' xmlns:xsi="' + opts.webxml_webapp_xmlns_xsi + '"';
        xml += ' xsi:schemaLocation="' + opts.webxml_webapp_xsi_schema_location + '"';
        xml += '>\n';

        xml += '<display-name>' + opts.webxml_display_name + '</display-name>\n';
        xml += '<welcome-file-list>';
        xml += '<welcome-file>' + opts.webxml_welcome + '</welcome-file>';
        xml += '</welcome-file-list>\n';

        if ( opts.webxml_mime_mapping ) {
            opts.webxml_mime_mapping.forEach( function ( mime_map ) {
                xml += '<mime-mapping>';
                xml += '<extension>' + mime_map.extension + '</extension>';
                xml += '<mime-type>' + mime_map.mime_type + '</mime-type>';
                xml += '</mime-mapping>\n';
            } );
        }

        xml += '</web-app>\n';

        return xml;

    };
};
