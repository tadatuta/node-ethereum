var Trie = require('../lib/trie/trie');
var Util = require('../lib/util');
var assert = require('assert');

var fakeDB = {
  db: {},
  put: function (key, value) {
    this.db[key] = value;
  },
  get: function (key) {
    if (this.db[key]) {
      return {
        data: this.db[key]
      };
    } else {
      return {
        error: 'value associated with key: ' + key + ' doesnt exist'
      };
    }
  },
  del: function (key) {
    delete this.db[key];
  },
  reset: function () {
    this.db = {};
  },
  isEmpty: function () {
    return Util.isEmpty(this.db)
  },
  size: function () {
    return Util.size(this.db);
  }
};
const LONG_VALUE = "1234567890abcdefghijklmnopqrstuvwxxzABCEFGHIJKLMNOPQRSTUVWXYZ";

describe('Type checks:', function () {
  it('should type check trie.', function () {
    var n = new Trie(fakeDB, '', '');
    assert(Util.isTrie(n));
  });
});

describe('should sync:', function () {
  afterEach(fakeDB.reset);
  var trie = new Trie(fakeDB, '', '');
  it('should sync and update the db accordingly.', function () {
    trie.update("dog", LONG_VALUE);
    assert(fakeDB.isEmpty());
    //sync
    trie.cache.commit();
    assert(!fakeDB.isEmpty());
  });
});

describe('should undo:', function () {
  afterEach(fakeDB.reset);
  var trie = new Trie(fakeDB, '', '');
  it('should undo and update the db accordingly.', function () {
    trie.update("dog", LONG_VALUE);
    trie.cache.commit();
    var size = fakeDB.size();
    //adding something else
    trie.update("test", LONG_VALUE);
    trie.cache.undo();
    assert(size == fakeDB.size());
  });
});

describe('should cache nodes:', function () {
  after(fakeDB.reset);
  var trie = new Trie(fakeDB, '', '');
  it('cache nodes size should increase when we update trie.', function () {
    trie.update("dog", LONG_VALUE);
    var size = Util.size(trie.cache.nodes);
    assert(size > 0);
  });
  it('cache nodes size should stay the same when we undo cache', function () {
    trie.cache.undo();
    var size = Util.size(trie.cache.nodes);
    assert(size === 0);
  });
});

describe('Should be able to update and get trie:', function () {
  afterEach(fakeDB.reset);

  it('should update the trie with value provided.', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('dog', LONG_VALUE);
    var result = trie.get('dog');
    assert(Util.deepEqual(result, LONG_VALUE));
  });

  it('should do replace when update with same key', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('dog', LONG_VALUE);
    var result = trie.get('dog');
    trie.update('dog', LONG_VALUE + 'yolo');
    result = trie.get('dog');
    assert(Util.deepEqual(result, LONG_VALUE + 'yolo'));
  });
});

describe('Should be able to delete nodes from trie:', function () {
  afterEach(fakeDB.reset);

  it('should be able to delete node.', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('cat', LONG_VALUE);
    var expected = trie.root;
    trie.update('dog', LONG_VALUE);
    trie.del('dog');
    assert.deepEqual(trie.root, expected);

  });
});

describe.skip('Testing root hash', function (argument) {
  it('should match the python implementation', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('dog', 'puppy');
    trie.update('horse', 'stallion');
    trie.update('do', 'verb');
    trie.update('doge', 'coin');

    assert.equal(trie.root, '5991bb8c6514148a29db676a14ac506cd2cd5775ace63c30a4fe457715e9ac84');
  });

  it('should match cpp state hash', function () {
    var g = new Buffer('8a40bfaa73256b60764c1bf40675a99083efb075', 'hex');
    var j = new Buffer('e6716f9544a56c530d868e4bfbacb172315bdead', 'hex');
    var v = new Buffer('1e12515ce3e0f817a4ddef9ca55788a1d66bd2df', 'hex');
    var a = new Buffer('1a26338f0d905e295fccb71fa9ea849ffa12aaf4', 'hex');
    var hash = new Sha3.SHA3Hash(256);

    var stateRoot = new Buffer(32);
    stateRoot.fill(0);
    var startAmount = new Buffer(26);
    startAmount.fill(0);
    startAmount[0] = 1;
    var account = [startAmount, 0, stateRoot, new Buffer(hash.digest('hex'), 'hex')];
    var data = rlp.encode(account);
    console.log("Account: ", data.toString('hex'));
    trie.update(g, data);
    console.log("trie root: ", trie.root.toString('hex'));
    trie.update(j, data)
    console.log("trie root: ", trie.root.toString('hex'));

    trie.update(v, data)
    console.log("trie root: ", trie.root.toString('hex'));

    trie.update(a, data);
    console.log("trie root: ", trie.root.toString('hex'));

  });
});