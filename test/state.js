var State = require('../lib/chain/state.js');
var assert = require('assert');

describe('Type checks:', function () {
  it('should type check state.', function () {

  });

  it('should know if the state object is account', function () {
    var acc = new State().createAccount();
    assert(!acc.isContract);
  });

  it('should know if the state object is contract', function () {
    var acc = new State().createContract();
    assert(acc.isContract);
  });
});

describe('State Hash', function () {
  it('should have the same account hash as C++ code', function () {
    var cppAccHash = "f85e9a010000000000000000000000000000000000000000000000000080a00000000000000000000000000000000000000000000000000000000000000000a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

    //create account
    var address = new Buffer('doesNotMatterInThisCase');
    var amt = new Buffer(26).fill(0);
    amt[0] = 1;
    var s = new State().createAccount(address, amt);
    assert.deepEqual(s.hash(), new Buffer(cppAccHash, 'hex'));
  });
});