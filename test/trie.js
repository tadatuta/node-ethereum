var Trie = require('../lib/trie/trie');
var State = require('../lib/chain/state');
var Util = require('../lib/util');
var assert = require('assert');
var RLP = require('rlp');
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

describe('[Trie]: Basic functions', function () {
  afterEach(fakeDB.reset);
  var trie = new Trie(fakeDB, '', '');

  it('should type check trie.', function () {
    assert(Util.isTrie(trie));
  });

  it('should sync and update the db accordingly.', function () {
    trie.update("dog", LONG_VALUE);
    assert(fakeDB.isEmpty());
    //sync
    trie.cache.commit();
    assert(!fakeDB.isEmpty());
  });

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

describe('[Trie]: Cache nodes', function () {
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

describe('[Trie]: Update/Get', function () {
  afterEach(fakeDB.reset);

  it('should update the trie with value provided', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('dog', LONG_VALUE);
    var result = trie.get('dog');
    assert.equal(result, LONG_VALUE);
  });

  it('should do replace when update with same key', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('dog', LONG_VALUE);
    var result = trie.get('dog');
    trie.update('dog', LONG_VALUE + 'yolo');
    result = trie.get('dog');
    assert.equal(result, LONG_VALUE + 'yolo');
  });
});

describe('[Trie]: Delete', function () {
  afterEach(fakeDB.reset);

  it('should be able to delete node', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('cat', LONG_VALUE);
    var expected = trie.root;
    trie.update('dog', LONG_VALUE);
    trie.del('dog');
    assert.deepEqual(trie.root, expected);

  });
});