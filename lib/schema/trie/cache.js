var Util = require('../../util');

function cache(nodes, db, dirty) {
  this.nodes = nodes || [];
  this.db = db;
  this.dirty = dirty || false;
}

// Save to db
cache.prototype.commit = function () {

};

// revert
cache.prototype.undo = function () {
  this.dirty = false;
};

cache.prototype.put = function () {

};
/**
 * Get value from key in cache
 * @param {String} key
 * @returns {{data: String, error: String}}
 **/
cache.prototype.get = function (key) {
  // First check if the key is the cache
  if (this.nodes[key] && Util.isNode(this.nodes[key])) {
    return {
      data: cache.nodes[key].val
    };
  }

  // Get the key of the database instead and cache it
  dbObj: = cache.db.get(key);
  if (dbObj.error) {
    return {
      error: dbObj.error
    };
  } else if (dbObj.data) {
    var value = new Buffer(dbObj.data)
  }
  // Create the cached value
  value: = NewValueFromBytes(data)
  // Create caching node
  cache.nodes[string(key)] = NewNode(key, value, false)

  return value
};

exports = module.exports = cache;