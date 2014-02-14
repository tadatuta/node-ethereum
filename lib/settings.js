var path = require('path');

var Settings = exports.Settings = function() {
  this.db = {};
  this.network = {};
  this.init();
}
Settings.prototype.init = function() {
  this.homedir = Settings.getDefaultHome();

  // db
  this.db.uri = path.resolve(this.homedir, 'leveldb/');

  // network
  this.network.magicToken = new Buffer([34, 64, 8, 145]);
}

Settings.prototype.getDefaultHome = function() {
  //only supports certain OS
  return process.env.HOME + "/.ethereum";
};