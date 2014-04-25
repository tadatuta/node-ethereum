var Util = require('../../util');
var RLP = require('rlp');
var Node = require('./node');

/**
 * Create a caching layer for the patricia tree
 * @Constructor
 * @param {Database} db
 * @param {Object} [nodes] - key value pair of all nodes in trie. With key being Sha3 of value
 * @param {Boolean} [dirty] - Is this cache modifed?
 **/
function cache(db, nodes, dirty) {
  this.nodes = nodes || {};
  this.db = db;
  this.dirty = dirty || false;
}

/**
 * Update/sync the database with cache
 **/
cache.prototype.commit = function () {
  if (!this.dirty) {
    return;
  }

  for (var key in this.nodes) {
    if (this.nodes[key].dirty) {
      this.db.put(key, RLP.encode(this.nodes[key].val));
      this.nodes[key].dirty = false
    }
  }
  this.dirty = false

  // TODO: figure out what to do with cache overflow
};

/**
 * Revert all changes in cache
 **/
cache.prototype.undo = function () {
  for (var key in this.nodes) {
    if (this.nodes[key].dirty) {
      delete this.nodes[key];
    }
  }
  this.dirty = false;
};

/**
 * Updating records in cache
 * @param  {Array} val Array of [CompactEncode(key), value]
 * @return {String}     the key inside of this.nodes[], can be hash or the val passed in
 */
cache.prototype.put = function (val) {
  if (!val) val = '';
  var encodedVal = RLP.encode(val)

  if (Util.byteLength(encodedVal) >= 32) {
    var hash = Util.sha3(Util.stringToHex(encodedVal));
    this.nodes[hash] = new Node(hash, val, true);
    this.dirty = true;
    // console.log('[Cache.put] - encodedVal>=32:' + encodedVal.toString('hex'));

    return hash;
  }
  // console.log('[Cache.put] - encodedVal<32:' + encodedVal.toString('hex'));
  return val;
};

/**
 * Get value from key in cache
 * @param {String} key
 * @returns {{data: String, error: String}} - return data if no error, otherwise, error message
 **/
cache.prototype.get = function (key) {
  // console.log('[Cache.get] - key:' + key);
  // First check if the key is the cache
  if (this.nodes[key] && Util.isNode(this.nodes[key])) {
    return {
      data: this.nodes[key].val
    };
  }
  // console.log('[Cache.get] - this.nodes[key]:' + this.nodes[key].val);
  // Get the key of the database instead and cache it
  dbObj = this.db.get(key);
  if (dbObj.error) {
    return {
      error: dbObj.error
    };
  } else if (dbObj.data) {
    //RLP decode the value stored in db
    dbObj.data = RLP.decode(dbObj.data);
    //make sure it's buffer
    if (!Buffer.isBuffer(dbObj.data)) {
      dbObj.data = new Buffer(dbObj.data);
    }
    //update cache
    this.nodes[key] = new node(key, dbObj.data, false);
  }

  return {
    data: dbObj.data
  }
};

/**
 * Delete value with key in cache
 * @param {String} key
 * @returns {{error: String}} - returns error message if error'd
 **/
cache.prototype.delete = function (key) {
  if (this.node[key]) {
    delete this.node[key];
    dbObj = this.db.delete(key);
    if (dbObj.error) {
      return {
        error: dbObj.error
      };
    }
  } else {
    return {
      // error: '[Cache.delete] - Key: ' + key + ' does not exist in the cache'
    };
  }
}

exports = module.exports = cache;