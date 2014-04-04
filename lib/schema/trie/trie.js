var Util = require('../../util');
var Cache = require('./cache');
/**
 * Create a modified patricia tree
 * @Constructor
 * @param {Database} db
 * @param {String} [prevRoot] - type may change to buffer later
 * @param {String} [root] - type may change to buffer later
 **/
var trie = function (db, prevRoot, root) {
  this.prev = prevRoot || '';
  this.root = root || '';
  this.cache = new Cache(db);
};

// Wrappers for cache actions
trie.prototype.save = function () {
  this.cache.commit();
  this.prevRoot = this.root;
};

trie.prototype.revert = function () {
  this.cache.undo();
  this.root = this.prevRoot;
};

// Note that when updating a trie, you will need to store the key/value 
// pair (sha3(x), x) in a persistent lookup table when you create a node 
// with length >= 32, but if the node is shorter than that then you do not 
// need to store anything when length < 32 for the obvious reason that the 
// function f(x) = x is reversible.
trie.prototype.getNode = function (nodeHash) {
  if (nodeHash) {
    if (Util.byteLength(nodeHash) < 32) {
      return nodeHash;
    }
    return this.cache.get(nodeHash);
  }
};

trie.prototype.get = function (key) {
  var k = Util.compactHexDecode(key);
  return this.getState(this.root, k);
};

trie.prototype.update = function (key, value) {
  var k = Util.compactHexDecode(key);
  // console.log("[update]key: " + key);
  // console.log("[update]value: " + value);
  // console.log("[update]k: " + k);

  this.root = this.changeState(this.root, k, value);
};

trie.prototype.getState = function (node, key) {

};

trie.prototype.changeState = function (node, key, value) {
  if (!value || value === '') {
    return this.deleteState(node, key);
  } else {
    return this.insertState(node, key, value);
  }
};

trie.prototype.insertState = function (nodeHash, key, value) {
  if (Util.byteLength(key) === 0) {
    return value;
  }
  if (!nodeHash || Util.byteLength(nodeHash) === 0) {
    // This is a new node
    var newNode = [Util.compactEncode(key), value];
    return this.cache.put(newNode);
  }
  var currentNode = this.getNode(nodeHash);
  if (currentNode.error) {
    //log error properly, cheat for now
    console.log(currentNode.error);
  } else {
    currentNode = this.getNode(nodeHash).data;
    // console.log('currentNode: ' + currentNode);
  }
  // Check for "special" 2 slice type node
  if (Util.byteLength(currentNode) == 2) {
    // Decode the key

    k = Util.compactDecode(currentNode[0])
    v = currentNode[1];
    console.log("key -", key);
    console.log("2 case: k - ", k);
    console.log("2 case: v - ", v);

    // Matching key pair (ie. there's already an object with this key)
    if (k == key) {
      var newNode = [Util.compactEncode(key), value];
      return this.cache.put(newNode);
    }

    // var newHash interface {}
    // matchingLength: = MatchingNibbleLength(key, k)
    // if matchingLength == len(k) {
    //   // Insert the hash, creating a new node
    //   newHash = t.InsertState(v, key[matchingLength: ], value)
    // } else {
    //   // Expand the 2 length slice to a 17 length slice
    //   oldNode: = t.InsertState("", k[matchingLength + 1: ], v)
    //   newNode: = t.InsertState("", key[matchingLength + 1: ], value)
    //   // Create an expanded slice
    //   scaledSlice: = EmptyStringSlice(17)
    //   // Set the copied and new node
    //   scaledSlice[k[matchingLength]] = oldNode
    //   scaledSlice[key[matchingLength]] = newNode

    //   newHash = t.Put(scaledSlice)
    // }

    // if matchingLength == 0 {
    //   // End of the chain, return
    //   return newHash
    // } else {
    //   newNode: = [] interface {} {
    //     CompactEncode(key[: matchingLength]), newHash
    //   }
    //   return t.Put(newNode)
    // }
  } else {

    // Copy the current node over to the new node and replace the first nibble in the key
    // newNode: = EmptyStringSlice(17)

    // for i: = 0;
    // i < 17;
    // i++{
    //   cpy: = currentNode.Get(i).Raw()
    //   if cpy != nil {
    //     newNode[i] = cpy
    //   }
    // }

    // newNode[key[0]] = t.InsertState(currentNode.Get(key[0]).Raw(), key[1: ], value)

    // return t.Put(newNode)
  }

  return ""
};

trie.prototype.deleteState = function (node, key) {
  if (node && key) {

  } else {
    return {
      error: '[Trie.deleteState]: Two params required: node=' + node + ', key=' + key
    };
  }
};

exports = module.exports = trie;