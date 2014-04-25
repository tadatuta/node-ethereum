var assert = require('assert');
var Util = require('../lib/util');

describe('Sha3 256 bits:', function () {
  var expectedHash = "7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331";
  var sha3Hash = Util.sha3('HelloWorld');
  it('should equal expected hash string',
    function () {
      assert.equal(expectedHash, sha3Hash);
    });
});

describe('Compact encoding:', function () {
  it('should handle even case.', function () {
    var testBuffer = [1, 2, 3, 4, 5];
    var res = Util.compactEncode(testBuffer).toJSON();
    assert.deepEqual([17, 35, 69], res);
  });

  it('should handle odd case', function () {
    var testBuffer = [0, 1, 2, 3, 4, 5];
    var res = Util.compactEncode(testBuffer).toJSON();
    assert.deepEqual([0, 1, 35, 69], res);
  });
  it('should handle odd case with terminator', function () {
    var test = [6, 4, 6, 15, 6, 7, 16];
    var res = Util.compactEncode(test).toJSON();
    assert.deepEqual([32, 100, 111, 103], res);
  });

  it('should handle even case with terminator', function () {
    var test = [15, 1, 12, 11, 8, 16];
    var res = Util.compactEncode(test).toJSON();
    assert.deepEqual([63, 28, 184], res);
  });

});

describe('Compact hex decoding:', function () {
  it('should decode to hex.', function () {
    var exp = [7, 6, 6, 5, 7, 2, 6, 2, 16];
    var res = Util.compactHexDecode('verb');
    assert.deepEqual(exp, res);
  });

});

describe('Compact decoding:', function () {
  it('should handle even case.', function () {
    var testBuffer = new Buffer([17, 35, 69]);
    var exp = [1, 2, 3, 4, 5];
    var res = Util.compactDecode(testBuffer);
    assert.deepEqual(exp, res);
  });

  it('should handle odd case', function () {
    var testBuffer = new Buffer([0, 1, 35, 69]);
    var exp = [0, 1, 2, 3, 4, 5];
    var res = Util.compactDecode(testBuffer);
    assert.deepEqual(exp, res);
  });

  it('should handle odd case with terminator', function () {
    var testBuffer = new Buffer([32, 15, 28, 184]);
    var exp = [0, 15, 1, 12, 11, 8, 16];
    var res = Util.compactDecode(testBuffer);
    assert.deepEqual(exp, res);
  });
  it('should handle even case with terminator', function () {
    var testBuffer = new Buffer([63, 28, 184]);
    var exp = [15, 1, 12, 11, 8, 16];
    var res = Util.compactDecode(testBuffer);
    assert.deepEqual(exp, res);
  });

});