'use strict';

var fs = require('fs');
var zlib = require('zlib');

// Minimal zip reader: walks the central directory and returns
// { name: { method: <0 stored | 8 deflate>, data: <string> } }.
function readWar(file) {
  var buf = fs.readFileSync(file);
  var eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) {
    eocd--;
  }
  if (eocd < 0) {
    throw new Error('Not a zip file: ' + file);
  }

  var count = buf.readUInt16LE(eocd + 10);
  var pos = buf.readUInt32LE(eocd + 16);
  var entries = {};

  for (var i = 0; i < count; i++) {
    var method = buf.readUInt16LE(pos + 10);
    var compressedSize = buf.readUInt32LE(pos + 20);
    var nameLength = buf.readUInt16LE(pos + 28);
    var extraLength = buf.readUInt16LE(pos + 30);
    var commentLength = buf.readUInt16LE(pos + 32);
    var localOffset = buf.readUInt32LE(pos + 42);
    var name = buf.toString('utf8', pos + 46, pos + 46 + nameLength);

    var dataStart = localOffset + 30 +
      buf.readUInt16LE(localOffset + 26) + buf.readUInt16LE(localOffset + 28);
    var raw = buf.slice(dataStart, dataStart + compressedSize);

    entries[name] = {
      method: method,
      data: (method === 8 ? zlib.inflateRawSync(raw) : raw).toString('utf8')
    };
    pos += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

exports.war = {
  default_options: function (test) {
    var war = readWar('tmp/default_options.war');

    test.deepEqual(Object.keys(war).sort(),
      ['123', 'META-INF/', 'WEB-INF/web.xml', 'testing'],
      'should contain the source files plus a generated web.xml and META-INF folder.');
    test.equal(war.testing.data, 'Testing');
    test.equal(war['123'].data, '1 2 3');
    test.equal(war.testing.method, 8, 'should DEFLATE by default.');

    var webxml = war['WEB-INF/web.xml'].data;
    test.ok(webxml.indexOf('version="3.0"') !== -1, 'should default to webapp version 3.0.');
    test.ok(webxml.indexOf('<display-name>Grunt WAR</display-name>') !== -1);
    test.ok(webxml.indexOf('<welcome-file>index.html</welcome-file>') !== -1);
    test.done();
  },

  custom_options: function (test) {
    test.ok(fs.existsSync('tmp/custom_options.war'), 'should not append a second .war extension.');
    var war = readWar('tmp/custom_options.war');

    test.deepEqual(Object.keys(war).sort(), [
      'META-INF/',
      'WEB-INF/display-name.txt',
      'WEB-INF/web.xml',
      'credits.txt',
      'empty-folder/',
      'static/123',
      'static/testing'
    ]);
    test.equal(war['static/testing'].data, 'Testing', 'should honor dest prefixes.');
    test.equal(war['credits.txt'].data, 'Thanks!\n', 'should add string war_extras.');
    test.equal(war['WEB-INF/display-name.txt'].data, 'Custom WAR', 'should call function war_extras with options.');
    test.ok(Object.keys(war).every(function (name) {
      return war[name].method === 0;
    }), 'should store every entry uncompressed when war_compression is NONE.');

    var webxml = war['WEB-INF/web.xml'].data;
    test.ok(webxml.indexOf('version="2.5"') !== -1);
    test.ok(webxml.indexOf('<display-name>Custom WAR</display-name>') !== -1);
    test.ok(webxml.indexOf('<welcome-file>home.html</welcome-file>') !== -1);
    test.ok(webxml.indexOf('<mime-mapping><extension>woff</extension>' +
      '<mime-type>application/font-woff</mime-type></mime-mapping>') !== -1);
    test.ok(webxml.indexOf('<login-config />\n<!-- custom_options.war -->\n</web-app>') !== -1,
      'should append string and function webxml_webapp_extras in order.');
    test.done();
  },

  provided_webxml: function (test) {
    var war = readWar('tmp/provided_webxml.war');

    test.deepEqual(Object.keys(war).sort(),
      ['META-INF/MANIFEST.MF', 'WEB-INF/web.xml', 'index.html'],
      'should not generate web.xml or META-INF when the project provides them.');
    test.equal(war['WEB-INF/web.xml'].data,
      fs.readFileSync('test/fixtures/provided/WEB-INF/web.xml', 'utf8'));
    test.done();
  },

  webxml_function: function (test) {
    var war = readWar('tmp/webxml_function.war');

    test.equal(war['WEB-INF/web.xml'].data, '<web-app><!-- webxml_function --></web-app>\n',
      'should use options.webxml in place of the generated web.xml.');
    test.done();
  }
};
