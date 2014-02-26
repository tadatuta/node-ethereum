var Node = require('../lib/schema/trie/node');
var Util = require('../lib/util');
var assert = require('assert');

describe('Type checks:', function () {
  it('should type check node.', function () {
    var n = new Node('key', 'value', true);
    assert(Util.isNode(n));
  })
});

describe('Node deep copy:', function () {
  var n = new Node('dog', 'cat', true);
  var m = n.deepCopy();
  n.key = 'god'
  it('m should not be affected by changes of n:',
    function () {
      assert.equal(m.key, 'dog');
    });
});