var State = require('./state');
var Trie = require('../trie/trie');
var Db = require('../db');

var WorldState = function (trie, stateArr) {
  this.trie = trie || new Trie(Db, '');
  this.stateArr = stateArr || [];
};


WorldState.prototype.reset = function () {
  this.trie.revert();
  for (var i in this.stateArr) {
    this.stateArr[i].reset();
  }
};

WorldState.prototype.save = function () {
  this.trie.save();
  for (var i in this.stateArr) {
    this.stateArr[i].save();
  }
};

WorldState.prototype.destroy = function () {

};

// Manipulating state objects

WorldState.prototype.updateState = function (newState) {
  var addr = newState.address;
  if (newState.worldState) {
    this.stateArr[addr] = newState.worldState;
  }
  //update trie
  this.trie.update(addr, newState.rlpEncode());
};

WorldState.prototype.getState = function (address) {
  var data = this.trie.get(address);
  var state = this.state.createStateFromBuffer();
  //TODO: put the state caching layer here
  return state;

}

WorldState.prototype.hash = function () {
  return this.trie.root;
}
exports = module.exports = WorldState;