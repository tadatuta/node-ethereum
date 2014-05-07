var async = require('async'),
  Block = require('./block.js'),
  internals = {};

internals.Blockchain = module.exports = function (db) {
  this.db = db;
};

/*
 * Adds a block to the blockchain
 * @method addBlock
 * @param {object} block -the block to be added to the block chain
 * @param {function} cb - a callback function
 * TODO: validate states
 */
internals.Blockchain.prototype.addBlock = function (block, cb) {
  var blockHash = block.hash(),
    self = this;

  //find parent block
  this.db.get(block.header.parentHash.toString('hex'), function (err, parentBlock) {
    async.parallel([
      function () {
        //add a child to the parent block
        if (!err) {
          parentBlock.child = blockHash;
          self.db.put(block.header.parentHash, parentBlock);
        }
      },
      function () {
        //save block
        self.db.put(block.hash(), {
          data: block.serialize()
        });
      }
    ], function () {
      //run callback
      if (typeof (cb) == 'function') {
        block._inBlockChain = true;
        cb(err, block);
      }
    });
  });
};

/*
 *Gets a block by its hash
 * @method getBlock
 * @param {String} hash - the sha256 hash of the rlp encoding of the block
 * @param {Function} cb - the callback function
 */
internals.Blockchain.prototype.getBlock = function (hash, cb) {
  this.db.get(hash, function (err, value) {
    //run callback
    if (typeof (cb) == 'function') {
      var block = null;
      if (!err) {
        block = new Block(value.data);
      } else {
        block._inBlockChain = true;
        block._childHash = value.child;
      }
      cb(err, block);
    }
  });
};

/*
 * Gets a segment of the blockchain starting at one of the parnet hashes
 * @method getBlockChain
 * @param {Array} parentHashes - an array of parents hashes to start from
 * @param {Interger} count the number of blocks to return
 * @param {Function} cb - the callback which is passed any errors and the blocks
 */
internals.Blockchain.prototype.getBlockChain = function (parentHashes, count, cb) {
  var i = 0,
    foundParent = false;

  if (typeof (cb) != 'function') {
    cb = function () {};
  }

  //find the parent
  async.whilst(function () {
    return !foundParent && i < parentHashes.length;
  }, function () {
    db.get(parentHashes[i], function (err, value) {
      i++;
      if (!err) {
        foundParent = value;
      }
    });
  }, function (err) {
    if (foundParent && foundParent.child && !err) {
      var blocksFound = [];
      //find the children
      async.whilst(function () {
        return blocksFound.length < count && foundParent && foundParent.child;
      }, function () {
        db.get(foundParent.child, function (err, value) {
          if (!err) {
            blocksFound.push(new Block(value.data));
            foundParent = value;
          }
        });
      }, function (err) {
        cb(err, blocksFound);
      });
    } else {
      cb(err, null);
    }
  });
};

internals.Blockchain.prototype.getHead = function (hash) {};
