var Util = require('../../util');
var Cache = require('./cache');
/**
 * Create a modified patricia tree
 * @Constructor
 * @param {Database} db
 * @param {String} [prevRoot] - type may change to buffer later
 * @param {String} [root] - type may change to buffer later
 **/
var trie = function (db, prevRoot, root) {
  this.prev = prevRoot || '';
  this.root = root || '';
  this.cache = new Cache(db);
};

// Wrappers for cache actions
trie.prototype.save = function () {
  this.cache.commit();
  this.prevRoot = this.root;
};

trie.prototype.revert = function () {
  this.cache.undo();
  this.root = this.prevRoot;
};

// Note that when updating a trie, you will need to store the key/value 
// pair (sha3(x), x) in a persistent lookup table when you create a node 
// with length >= 32, but if the node is shorter than that then you do not 
// need to store anything when length < 32 for the obvious reason that the 
// function f(x) = x is reversible.
trie.prototype.getNode = function (nodeHash) {
  if (nodeHash) {
    if (Util.byteLength(nodeHash) < 32) {
      return nodeHash;
    }
    return this.cache.get(nodeHash);
  }
}

trie.prototype.changeState = function (node, key, value) {
  if (!value || value === '') {
    this.deleteState(node, key);
  } else {
    this.insertState(node, key, value);
  }
};

trie.prototype.insertState = function (node, key, value) {
  if (Util.byteLength(key) === 0) {
    return value;
  }
  if (!node || Util.byteLength(node) === 0) {
    // This is a new node
    var newNode = {
      key: Util.compactEncode(key),
      value: value
    }
  }
};

trie.prototype.deleteState = function (node, key) {
  if (node && key) {

  } else {
    return {
      error: '[Trie.deleteState]: Two params required: node=' + node + ', key=' + key
    };
  }
};

exports = module.exports = trie;