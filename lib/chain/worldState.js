var State = require('./state');
var Trie = require('../trie/trie');
var Db = require('../db');

var WorldState = function (trie, stateArr) {
  this.trie = trie | new Trie(Db, '');
  this.stateArr = stateArr | [];
};


WorldState.prototype.reset = function () {

};

WorldState.prototype.destroy = function () {

};

WorldState.prototype.getState = function () {

};

WorldState.prototype.updateState = function (state) {

};

WorldState.prototype.hash = function () {
  return this.trie.root;
}
exports = module.exports = WorldState;