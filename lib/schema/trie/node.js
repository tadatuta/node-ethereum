/**
 * Create a node within a modified patricia tree
 * @Constructor
 **/
function node(key, val, dirty) {
  this.key = key;
  this.val = val;
  this.dirty = dirty || false;
}

/**
 * Deep copy a node
 * @returns {Node} copy
 **/
node.prototype.deepCopy = function () {
  return new node(this.key, this.val, this.dirty);
};

exports = module.exports = node;