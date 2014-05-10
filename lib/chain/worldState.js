var State = require('./state');
var Trie = require('../trie/trie');

var WorldState = function (stateArr, trie) {
  this.stateArr = stateArr | [];
  this.trie = trie | new Trie(null, '', '');
};

exports = module.exports = WorldState;