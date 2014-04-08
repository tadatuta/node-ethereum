var Trie = require('../lib/schema/trie/trie');
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

describe('Should update:', function () {
  afterEach(fakeDB.reset);

  it('should update the trie with value provided.', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('dog', LONG_VALUE);
    console.log(trie.root);
    trie.update('test', LONG_VALUE);
  });

  it('should do replace when update with same key', function () {
    var trie = new Trie(fakeDB, '', '');
    trie.update('dog', LONG_VALUE);
    var result = trie.get('dog');
    console.log('results:' + result);
    trie.update('dog', LONG_VALUE + 'yolo');
    result = trie.get('dog');
    console.log('results:' + result);
    // assert(result == LONG_VALUE);
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