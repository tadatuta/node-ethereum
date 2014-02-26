var Node = require('../lib/schema/trie/node');
var assert = require('assert');

describe('Node deep copy:', function () {
  var n = new Node('dog', 'cat', true);
  var m = n.deepCopy();
  n.key = 'god'
  it('m should not be affected by changes of n:',
    function () {
      assert.equal(m.key, 'dog');
    });
});