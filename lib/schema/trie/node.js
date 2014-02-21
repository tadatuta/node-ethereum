function node(key, val, dirty) {
  this.key = key;
  this.val = val;
  this.dirty = dirty || false;
}

node.prototype.deepCopy = function(n) {
  return new node(n.key, n.val, n.dirty);
};

exports = module.exports = node;