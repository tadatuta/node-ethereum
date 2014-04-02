var Trie = require('../lib/schema/trie/trie');
var Util = require('../lib/util');
var assert = require('assert');

var fakeDB = {
  db: {},
  put: function (key, value) {
    this.db[key] = value;
  },
  get: function (key) {
    return this.db[key] || null;
  },
  del: function (key) {
    delete this.db[key];
  }
};
const LONG_VALUE = "1234567890abcdefghijklmnopqrstuvwxxzABCEFGHIJKLMNOPQRSTUVWXYZ";

describe('Type checks:', function () {
  it('should type check trie.', function () {
    var n = new Trie(fakeDB, '', '');
    assert(Util.isTrie(n));
  })
});

describe('Should update:', function () {
  it('should update the trie with value provided.', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('dog', LONG_VALUE);
  })
});