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

// describe('Type checks:', function () {
//   it('should type check trie.', function () {
//     var n = new Trie(fakeDB, '', '');
//     assert(Util.isTrie(n));
//   });
// });

// describe('should sync:', function () {
//   afterEach(fakeDB.reset);
//   var trie = new Trie(fakeDB, '', '');
//   it('should sync and update the db accordingly.', function () {
//     trie.update("dog", LONG_VALUE);
//     assert(fakeDB.isEmpty());
//     //sync
//     trie.cache.commit();
//     assert(!fakeDB.isEmpty());
//   });
// });

// describe('should undo:', function () {
//   afterEach(fakeDB.reset);
//   var trie = new Trie(fakeDB, '', '');
//   it('should undo and update the db accordingly.', function () {
//     trie.update("dog", LONG_VALUE);
//     trie.cache.commit();
//     var size = fakeDB.size();
//     //adding something else
//     trie.update("test", LONG_VALUE);
//     trie.cache.undo();
//     assert(size == fakeDB.size());
//   });
// });

// describe('should cache nodes:', function () {
//   after(fakeDB.reset);
//   var trie = new Trie(fakeDB, '', '');
//   it('cache nodes size should increase when we update trie.', function () {
//     trie.update("dog", LONG_VALUE);
//     var size = Util.size(trie.cache.nodes);
//     assert(size > 0);
//   });
//   it('cache nodes size should stay the same when we undo cache', function () {
//     trie.cache.undo();
//     var size = Util.size(trie.cache.nodes);
//     assert(size === 0);
//   });
// });

describe('Should be able to update and get trie:', function () {
  afterEach(fakeDB.reset);

  // it('should update the trie with value provided.', function () {
  //   var trie = new Trie(fakeDB, '', '');
  //   trie.update('dog', LONG_VALUE);
  //   var result = trie.get('dog');
  //   assert(Util.deepEqual(result, LONG_VALUE));
  // });

  it('should work for official universal trie test #1', function () {
    var trie = new Trie(fakeDB, '', '');
    var exp = 'd85f9267d7ed5767fb1b48defa8eb20a1c007a87a07588135a74b40b55de2e67';
    trie.update('doe', 'reindeer');
    trie.update('dog', 'puppy');
    trie.update('dogglesworth', 'cat');
    console.log('official trie test #1 root:' + trie.root);
    assert(Util.deepEqual(exp, trie.root));
  });

  // it('should work for official universal trie test #2', function () {
  //   var trie = new Trie(fakeDB, '', '');
  //   var exp = 'cf7d318935b52db6e23d8c1f5e6b7e62f3606d4ed13783f4fdbd6e67a2085d04';
  //   trie.update('do': 'verb');
  //   trie.update('horse', 'stallion');
  //   trie.update('doge', 'coin');
  //   trie.update('dog', 'puppy');
  //   console.log('official trie test #2 root:' + trie.root);
  //   assert(Util.deepEqual(exp, trie.root));
  // });

  // it('should do replace when update with same key', function () {
  //   var trie = new Trie(fakeDB, '', '');
  //   trie.update('dog', LONG_VALUE);
  //   var result = trie.get('dog');
  //   trie.update('dog', LONG_VALUE + 'yolo');
  //   result = trie.get('dog');
  //   assert(Util.deepEqual(result, LONG_VALUE + 'yolo'));
  // });
});

// describe('Should be able to delete nodes from trie:', function () {
//   afterEach(fakeDB.reset);

//   it('should be able to delete node.', function () {
//     var trie = new Trie(fakeDB, '', '');
//     trie.update('cat', LONG_VALUE);
//     var expected = trie.root;
//     console.log(expected);
//     trie.update('dog', LONG_VALUE);
//     trie.del('dog');
//     console.log(trie.root);
//     assert(Util.deepEqual(expected, trie.root));
//   });
// });