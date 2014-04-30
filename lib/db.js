var Settings = require("./settings");
var levelup = require('levelup');

var settingURI = Settings.db.uri;
var db = exports.db = levelup(settingURI);

// TODO: look more into option, potentially pass in Util.compactEncode/Decode
// as a part of options obj

var get = exports.get = function (key) {
  db.get(key, function (err, value) {
    if (err) {
      if (err.notFound) {
        return {
          error: '[DB.get]: Cannot find value for ' + key
        };
      }
      return {
        error: '[DB.get]:' + err
      };
    }
    //Returned some value
    return {
      data: value
    };
  })
};

var put = exports.put = function (key, value) {
  db.put(key, value, function (err) {
    if (err) {
      return {
        error: '[DB.put]: ' + err
      };
    }
  });
};

var del = exports.delete = function (key) {
  db.del(key, function (err) {
    if (err) {
      return {
        error: '[DB.del]: ' + err
      };
    }
  });
};

var LastKnownTD = exports.LastKnownTD = function () {
  var lastDiff = get('LastKnownTotalDifficulty');
  lastDiff.data = (lastDiff.error) ? 0 : lastDiff.data;
  return lastDiff;
};

var close = exports.close = function () {
  db.close(function (err) {
    if (err) {
      return {
        error: '[DB.close]: ' + err
      };
    }
  });
}
