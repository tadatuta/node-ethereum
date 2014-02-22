function cache(nodes, db, dirty) {
  this.nodes = nodes || [];
  this.db = db;
  this.dirty = dirty || false;
}

// Save to db
cache.prototype.commit = function() {

};

// revert
cache.prototype.undo = function() {
  this.dirty = false;
};

cache.prototype.put = function() {

};

cache.prototype.get = function() {

};

exports = module.exports = cache;