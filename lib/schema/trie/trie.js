var Util = require('../../util');

var trie = function (root, cache) {
  this.root = root;
  this.cache = cache;
};

// Wrappers for cache actions
trie.prototype.save = function () {
  this.cache.commit();
};

trie.prototype.revert = function () {
  this.cache.undo();
};