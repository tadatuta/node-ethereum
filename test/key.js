var assert = require('assert');
var Key = require('../lib/key');

describe('[Key] Basic functions', function () {
  it('should be able to generateSync instance', function () {
    var k = Key.generateSync();
    console.log(k.public.toHex());
    console.log(k.private.toHex());
  });
});