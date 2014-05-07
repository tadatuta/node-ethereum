var Util = require('../util');
var Cache = require('./cache');
var Logger = require('../logger');

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
    // console.log(nodeHash + ' - ' + Util.byteLength(nodeHash));
    if (Util.byteLength(nodeHash) < 32) {
      return {
        data: nodeHash
      };
    }
    return this.cache.get(nodeHash);
  }
};
//========== Basic functions of a trie ==========\\

/**
 * Get a value stored in the trie
 * @param  {String|Buffer} key
 * @return {String}     Return the value associated with the key.
 *                      If the key is not found, we return empty string.
 */
trie.prototype.get = function (key) {
  var k = Util.compactHexDecode(key);
  return this.getState(this.root, k);
};

/**
 * Update a value stored in the trie
 * @param  {String|buffer} key
 * @param  {String} value New value
 */
trie.prototype.update = function (key, value) {
  var k = Util.compactHexDecode(key);
  this.root = this.changeState(this.root, k, value);
};

/**
 * Delete a value stored in the trie
 * @param  {String|Buffer} key
 */
trie.prototype.del = function (key) {
  this.update(key, null);
}

trie.prototype.getState = function (nodeHash, key) {
  // console.log('[Trie.getState] - nodeHash:', nodeHash);
  // console.log('[Trie.getState] - key:', key);

  if (Util.byteLength(key) === 0 || !nodeHash || Util.byteLength(nodeHash) === 0) {
    // console.log('[Trie.getState] - returning node: ' + nodeHash)
    return nodeHash;
  }
  var currentNode = this.getNode(nodeHash);

  if (currentNode.error) {
    //log error properly, cheat for now
    // console.log(currentNode.error);
  } else {
    currentNode = currentNode.data;
    // console.log('[Trie.getState] - currentNode:', currentNode);

  }
  var length = Util.byteLength(currentNode);

  if (length === 0) {
    return "";
  } else if (length === 2) {
    // Decode the key
    var k = Util.compactDecode(currentNode[0]);
    var v = currentNode[1];
    // console.log('[Trie.getState]k:', k);
    // console.log('[Trie.getState]v:', v);

    if (Util.byteLength(key) >= Util.byteLength(k) && Util.deepEqual(k, key.slice(0, Util.byteLength(k)))) {
      return this.getState(v, key.slice(Util.byteLength(k)));
    } else {
      return "";
    }
  } else if (length === 17) {
    return this.getState(currentNode[key[0]], key.slice(1));
  }

  // It shouldn't come this far
  Logger.error("[Trie.getState]Current node length is not 0, 2, or 17");
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
  // console.log("[insertState] - nodeHash:" + nodeHash);
  // console.log("[insertState] - key:" + key);
  // console.log("[insertState] - value:" + value);

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
    Logger.error(currentNode.error);
  } else {
    currentNode = currentNode.data;
  }
  // console.log("[insertState] - currentNode:" + currentNode);
  // Check for "special" 2 slice type node
  if (Util.byteLength(currentNode) == 2) {
    // Decode the key

    k = Util.compactDecode(currentNode[0])
    v = currentNode[1];
    // console.log("[insertState] - key: ", key);
    // console.log("[insertState] - k: ", k);
    // console.log("[insertState] - v: ", v);

    // Matching key pair (ie. there's already an object with this key)
    if (Util.deepEqual(k, key)) {
      // console.log("[insertState]k and key are equal");
      var newNode = [Util.compactEncode(key), value];
      return this.cache.put(newNode);
    }

    var matchingLength = Util.longestPrefix(key, k);
    // console.log("[insertState] - matchingLength: ", matchingLength);

    if (matchingLength === Util.byteLength(k)) {
      //recurse with the rest of the key
      newHash = this.insertState(v, key.slice(matchingLength), value);
    } else {
      //case len-17 slice
      // console.log("[insertState]case-17");
      var oldNode = this.insertState('', k.slice(matchingLength + 1), v);
      // console.log("[insertState] - oldNode: ", oldNode);

      var newNode = this.insertState('', key.slice(matchingLength + 1), value);
      // console.log("[insertState] - newNode: ", newNode);

      //expanded array
      var scaledArray = Util.emptyStringArray(17);
      scaledArray[k[matchingLength]] = oldNode;
      scaledArray[key[matchingLength]] = newNode;
      // console.log("[insertState] - scaledArray: ", scaledArray);

      newHash = this.cache.put(scaledArray);
      // console.log("[insertState] - newHash: ", newHash);
    }

    if (matchingLength === 0) {
      return newHash;
    } else {
      // console.log("[insertState] - key.slice(0, matchingLength): ", key.slice(0, matchingLength))
      var newNode = [Util.compactEncode(key.slice(0, matchingLength)), newHash];
      // console.log("[insertState] - newNode: ", newNode);
      return this.cache.put(newNode);
    }
  } else {
    // Copy the current node over to the new node and replace the first nibble in the key
    var newNode = Util.emptyStringArray(17);
    // console.log("[inserState]Copy current node over to new node, replace first nibble")
    for (var i = 0; i < 17; i++) {
      var cpy = currentNode[i];
      if (cpy) {
        newNode[i] = cpy;
      }
    }
    // console.log("[insertState] - currentNode[key[0]]: ", currentNode[key[0]]);
    // console.log("[insertState] - key.slice(1): ", key.slice(1));
    // console.log("[insertState] - value: ", value);

    newNode[key[0]] = this.insertState(currentNode[key[0]], key.slice(1), value);
    return this.cache.put(newNode);
  }

  return ''
};

trie.prototype.deleteState = function (nodeHash, key) {
  if (nodeHash && key && Util.byteLength(key) !== 0 && Util.byteLength(nodeHash) !== 0) {
    var currentNode = this.getNode(nodeHash);

    if (currentNode.error) {
      //log error properly, cheat for now
      console.log(currentNode.error);
    } else {
      currentNode = currentNode.data;
    }
    // console.log("[Trie.deleteState] - currentNode:", currentNode);

    if (Util.byteLength(currentNode) === 2) {
      var k = Util.compactDecode(currentNode[0])
      var v = currentNode[1];
      // console.log("[Trie.deleteState] - key:", key);
      // console.log("[Trie.deleteState] - k: ", k);
      // console.log("[Trie.deleteState] - v: ", v);

      // Matching keys
      if (Util.deepEqual(k, key)) {
        // console.log("[Trie.deleteState]matching keys")
        return '';
      } else if (Util.deepEqual(k, key.slice(0, Util.byteLength(k)))) {
        var hash = this.deleteState(v, key.slice(Util.byteLength(k)));
        var child = this.getNode(hash);
        var newNode;
        if (child) {
          if (child.error) {
            console.log(child.error);
          } else {
            child = child.data;
          }
        }
        // console.log("[Trie.deleteState] - hash: ", hash);
        // console.log("[Trie.deleteState] - child: ", "[" + child[0].toString() + "," + child[1].toString() + "]");

        if (Util.byteLength(child) === 2) {
          var newKey = k.concat(Util.compactDecode(child[0]));
          // console.log("[Trie.deleteState] - newKey: ", newKey)
          newNode = [Util.compactEncode(newKey), child[1]];
        } else {
          newNode = [currentNode[0], hash];
        }
        // console.log("[Trie.deleteState] - newNode: ", "[" + newNode[0].toString() + "," + newNode[1].toString() + "]")

        return this.cache.put(newNode)
      } else {
        // console.log("[Trie.deleteState]returning node: ", nodeHash)
        return nodeHash;
      }
    } else {

      var newNode, child;
      var n = Util.emptyStringArray(17);
      for (var i = 0; i < 17; i++) {
        var cpy = currentNode[i];
        if (cpy) {
          n[i] = cpy;
        }
      }

      n[key[0]] = this.deleteState(n[key[0]], key.slice(1));
      var amount = -1;
      for (var i = 0; i < 17; i++) {
        if (n[i] != '') {
          if (amount === -1) {
            amount = i;
          } else {
            amount = -2;
          }
        }
      }
      if (amount === 16) {
        newNode = [Util.compactEncode([16]), n[amount]];
      } else if (amount >= 0) {
        child = this.getNode(n[amount]);
        if (child) {
          if (child.error) {
            console.log(child.error);
          } else {
            child = child.data;
          }
        }
        if (Util.byteLength(child) === 17) {
          newNode = [Util.compactEncode([amount]), n[amount]];
        } else if (Util.byteLength(child) === 2) {
          var newKey = [amount].concat(Util.compactDecode(child[0]))
          newNode = [Util.compactEncode(newKey), child[1]];
        }
      } else {
        newNode = n
      }
      // console.log("[Trie.deleteState] - amount: ", amount)
      // console.log("[Trie.deleteState] - n: ", n)
      // console.log("[Trie.deleteState] - newNode: ", newNode)

      return this.cache.put(newNode)
    }


  } else {
    return '';
  }
};

exports = module.exports = trie;