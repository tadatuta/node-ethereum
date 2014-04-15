var fs = require('fs');
var path = require('path');
var logger = require('./logger');
var mkdirp = require('mkdirp');

function Settings() {
  this.db = {};
  this.network = {};
  this.logger = {};
  this.init();
}
Settings.prototype.init = function () {
  this.homedir = this.getDefaultHome();

  // db
  this.db.uri = path.resolve(this.homedir, 'leveldb/');
  this.checkCreateDir(this.db.uri);
  // log
  this.logger.uri = 'logs/';
  this.checkCreateDir(this.logger.uri);
}

Settings.prototype.getDefaultHome = function () {
  //only supports certain OS
  var homeDir = process.env.HOME + "/.ethereum";
  return homeDir;
};

Settings.prototype.checkCreateDir = function (uri) {
  if (fs.existsSync(uri)) {
    logger.info('[Settings]: Directory found: ' + uri);
  } else {
    logger.warn('[Settings]: Directory not found, creating: ' + uri);
    mkdirp(uri, function (err) {
      if (err) {
        logger.error('[Settings]: Directory ' + uri + ' error: ' + err);
      }
    });
  }
};

exports = module.exports = new Settings();
