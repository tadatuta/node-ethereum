var Util = require('../../util');

function cache(nodes, db, dirty) {
  this.nodes = nodes || {};
  this.db = db;
  this.dirty = dirty || false;
}

/**
 * Update/sync the database with cache
 **/
cache.prototype.commit = function() {
  if (!this.cache.dirty) {
    return;
  }

  for (var key in this.nodes) {
    if (this.nodes[key].dirty) {
      this.db.put(key, Util.encodeRLP(this.nodes[key].val));
      this.nodes[key].dirty = false
    }
  }
  this.dirty = false

  // TODO: figure out what to do with cache overflow
};

/**
 * Revert all changes in cache
 **/
cache.prototype.undo = function() {
  for (var key in this.nodes) {
    if (this.nodes[key].dirty) {
      delete this.nodes[key];
    }
  }
  this.dirty = false;
};

cache.prototype.put = function() {

};

/**
 * Get value from key in cache
 * @param {String} key
 * @returns {{data: String, error: String}}
 **/
cache.prototype.get = function(key) {

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
    if (!Buffer.isBuffer(dbObj.data)) {
      dbObj.data = new Buffer(dbObj.data);
    }
    this.nodes[key] = new node(key, dbObj.data, false);
  }

  return {
    data: dbObj.data
  }
};

exports = module.exports = cache;