var Settings = require("./settings");
var levelup = require('levelup');

var settingURI = (new Settings()).db.uri;
console.log(settingURI);
var db = levelup(settingURI);

var get = exports.get = function(key) {
  console.log("Get method for db");
};

var put = exports.put = function(key, value) {
  console.log("Put method for db");
};

var del = exports.delete = function(key) {
  console.log("Delete method for db");
};

var LastKnownTD = exports.LastKnownTD = function() {
  console.log("Last known total difficulty");
};