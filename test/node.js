var Node = require('../lib/trie/node');
var Util = require('../lib/util');
var assert = require('assert');

describe('[Node]: Basic functions', function () {
  it('should type check node', function () {
    var n1 = new Node('str', 'value', true);
    var n2 = new Node('int', 5, true);
    var n3 = new Node('buf', new Buffer('value'), true);
    var n4 = new Node('buf', ['value'], true);
    assert(Util.isNode(n1));
    assert(Util.isNode(n2));
    assert(Util.isNode(n3));
    assert(Util.isNode(n4));
  });
  it('should deep copy', function () {
    var n = new Node('dog', 'cat', true);
    var m = n.deepCopy();
    n.key = 'god';
    assert.equal(m.key, 'dog');
  });
});