var WorldState = require('../lib/chain/worldState');
var State = require('../lib/chain/state');
var assert = require('assert');

describe('[WorldState]: Basic functions', function () {
  it('should type check world state.', function () {

  });
});

describe('[WorldState]: State Hash', function () {
  it('should have the same state root hash as C++ code', function () {
    var cppRootHash = "2f4399b08efe68945c1cf90ffe85bbe3ce978959da753f9e649f034015b8817d";

    var ws = new WorldState();
    var premines = [
      '8a40bfaa73256b60764c1bf40675a99083efb075',
      'e6716f9544a56c530d868e4bfbacb172315bdead',
      '1e12515ce3e0f817a4ddef9ca55788a1d66bd2df',
      '1a26338f0d905e295fccb71fa9ea849ffa12aaf4'
    ];

    for (var i in premines) {
      var address = new Buffer(premines[i], 'hex');
      //everyone gets 2^200
      var startAmount = new Buffer(26);
      startAmount.fill(0);
      startAmount[0] = 1;

      var account = new State().createAccount(address, startAmount);
      ws.updateState(account);
    }

    assert.deepEqual(ws.hash(), new Buffer(cppRootHash, 'hex'));
  });
});