var assert = require('assert');
var Key = require('../lib/key');

describe('[Key] Basic functions', function () {
  it('should be able to generateSync instance', function () {
    var k = Key.generateSync();
    k.compressed = false;
    assert(k.private.length, 32);
    assert(k.public.length, 65);
  });
});