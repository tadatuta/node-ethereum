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

trie.prototype.changeState = function (node, key, value) {
  if (!value || value === '') {
    this.deleteState(node, key, value);
  } else {
    this.insertState(node, key, value);
  }
};

trie.prototype.insertState = function () {

};

trie.prototype.deleteState = function () {

};

exports = module.exports = trie;