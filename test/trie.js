var Trie = require('../lib/schema/trie/trie');
var Util = require('../lib/util');
var assert = require('assert');

var fakeDB = {
  db: {},
  put: function (key, value) {
    this.db[key] = value;
  },
  get: function (key) {
    if (this.db[key]) {
      return {
        data: this.db[key]
      };
    } else {
      return {
        error: 'value associated with key: ' + key + ' doesnt exist'
      };
    }
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
    console.log(trie.root);
    trie.update('test', LONG_VALUE);
  })
});