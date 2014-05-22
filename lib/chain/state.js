var Bignum = require('bignum');
var Rlp = require('rlp');
var Logger = require('../logger');
var Db = require('../db');
var Util = require('../util');
var WorldState = require('./worldState');
var Trie = require('../trie/trie');

var State = function (address, amount, nonce, worldState, script, initScript) {
  this.address = address || new Buffer('');
  this.amount = amount || new Buffer(0);
  this.nonce = nonce || 0;
  this.worldState = worldState;
  // Contract attributes
  this.script = script || new Buffer('');
  this.initScript = initScript || new Buffer('');
  this.isContract = false;
};

State.prototype.createAccount = function (address, amount) {
  return new State(address, amount);
};

State.prototype.createContract = function (address, amount, root) {
  var contract = new State(address, amount);
  contract.worldState = new WorldState(new Trie(Db, root));
  contract.isContract = true;
  return contract;
};

State.prototype.createContractFromTx = function (tx, worldState) {

};

State.prototype.createStateFromBuffer = function (address, buf) {
  var state = new State(address);
  state.rlpDecode(buf);
  return state;
};
/**
 * RLP encodes the current state object
 * @return {Buffer} returns the buffer state object
 */
State.prototype.rlpEncode = State.prototype.hash = function () {
  var stateHash = Util.zero256();
  if (this.worldState) {
    stateHash = this.worldState.hash();
  }
  var codeHash = Util.sha3Bin(this.script);
  return Rlp.encode([this.amount, this.nonce, stateHash, codeHash]);
}
/**
 * RLP decodes a state buffer, and setting amount, nonce, worldState,
 * and script component of the state object accordingly
 * @param  {Buffer} buf State buffer
 */
State.prototype.rlpDecode = function (buf) {
  var arr = Rlp.decode(buf);
  this.amount = Bignum(arr[0]);
  this.nonce = arr[1]; //need to convert to int, or we store nonce as buffer
  this.worldState = new WorldState(new Trie(Db, arr[2]));
  this.script = arr[3];
}

//getters
State.prototype.isContract = function () {
  return this.isContract;
}

State.prototype.isAccount = function () {
  return !this.isContract;
}

State.prototype.addAmount = function (amount) {
  this.amount.add(amount);
}
State.prototype.subtractAmount = function (amount) {
  this.amount.sub(amount);
}


exports = module.exports = State;