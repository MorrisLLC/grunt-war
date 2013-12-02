/*
 * grunt-war
 * https://github.com/wibobm/grunt-war
 *
 * Copyright (c) 2013 rmorris
 * Licensed under the MIT license.
 */


module.exports = function(grunt) {

'use strict';

var zip = require('node-zip')();
var fs = require('fs');

 grunt.registerMultiTask('war', 'All your war belong to us.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
	files: []
    });
 
    try { 
       fs.unlinkSync('war/test.war');
      grunt.log.writeln('deleted old war ' );
    } catch (err) {
    }

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
       try { 
         var data = fs.readFileSync(''+f.src,'binary');
         zip.file((''+f.src).substring('build/'.length), data);
         grunt.log.writeln('adding: "' + f.src + '  ' + typeof data );
       } catch (err) {
//         grunt.log.writeln('Failed ' + f.src + '  ' + err );
       }
    });
    
        grunt.log.writeln('about to war');

    try {    
      var data = zip.generate({type:'nodebuffer',compression:'DEFLATE'});
      fs.writeFileSync('war/test.war',data,'binary');
    } catch (err) {
      grunt.log.writeln('Error creating war ' + err );
    }
});

};
