var Util = require('../../util');
var Cache = require('cache');
/**
 * Create a modified patricia tree
 * @Constructor
 **/
var trie = function (prevRoot, root, db) {
  this.prev = prevRoot;
  this.root = root;
  this.cache = new Cache(db);
};

// Wrappers for cache actions
trie.prototype.save = function () {
  this.cache.commit();
  this.prevRoot = this.root;
};

trie.prototype.revert = function () {
  this.cache.undo();
};

trie.prototype.changeState = function () {
  if
};

trie.prototype.insertState = function () {

};

trie.prototype.deleteState = function () {

};

exports = module.exports = Trie;