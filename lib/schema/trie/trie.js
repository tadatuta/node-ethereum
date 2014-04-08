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

trie.prototype.getState = function (nodeHash, key) {
  console.log('[Trie]getState - nodeHash:', nodeHash);
  console.log('[Trie]getState - key:', key);

  if (Util.byteLength(key) === 0 || !nodeHash || Util.byteLength(nodeHash) === 0) {
    return nodeHash;
  }
  var currentNode = this.getNode(nodeHash);
  if (currentNode.error) {
    //log error properly, cheat for now
    console.log(currentNode.error);
  } else {
    currentNode = this.getNode(nodeHash).data;
  }
  var length = Util.byteLength(currentNode);

  if (length === 0) {
    return "";
  } else if (length === 2) {
    // Decode the key
    var k = Util.compactDecode(currentNode[0]);
    var v = currentNode[1];

    if (Util.byteLength(key) >= Util.byteLength(k) && Util.deepEqual(k == key.slice(0, Util.byteLength(k)))) {
      return this.getState(v, key[Util.byteLength(k)]);
    } else {
      return "";
    }
  } else if (length === 17) {
    return this.getState(currentNode[key[0]], key.slice(1));
  }

  // It shouldn't come this far
  console.log("Shit happened, not sure why");
  return ""
};

trie.prototype.changeState = function (node, key, value) {
  if (!value || value === '') {
    return this.deleteState(node, key);
  } else {
    return this.insertState(node, key, value);
  }
};

trie.prototype.insertState = function (nodeHash, key, value) {
  var newHash;
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
    if (Util.deepEqual(k == key)) {
      var newNode = [Util.compactEncode(key), value];
      return this.cache.put(newNode);
    }

    var matchingLength = Util.longestPrefix(key, k);
    if (matchingLength === Util.byteLength(k)) {
      //recurse with the rest of the key
      newHash = this.insertState(v, key.slice(matchingLength), value);
    } else {
      //case len-17 slice
      var oldNode = this.insertState('', k.slice(matchingLength + 1), v);
      var newNode = this.insertState('', key.slice(matchingLength + 1), value);
      //expanded array
      var scaledArray = Util.emptyStringArray(17);
      scaledArray[k[matchingLength]] = oldNode;
      scaledArray[key[matchingLength]] = newNode;
      newHash = this.cache.put(scaledArray);
    }

    if (matchingLength === 0) {
      return newHash;
    } else {
      var newNode = [Util.compactEncode(key.slice(0, matchingLength)), newHash];
      return this.cache.put(newNode);
    }
  } else {
    // Copy the current node over to the new node and replace the first nibble in the key
    var newNode = Util.emptyStringArray(17);

    for (var i = 0; i < 17; i++) {
      var cpy = currentNode[i];
      if (cpy) {
        newNode[i] = cpy;
      }
    }
    newNode[key[0]] = this.insertState(currentNode[key[0]], key.slice(1), value);
    return this.cache.put(newNode);
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