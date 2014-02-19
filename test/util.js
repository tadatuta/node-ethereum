var assert = require('assert');
var Util = require('../lib/util');
var bignum = require('bignum');

describe('Sha3 256 bits:', function() {
  var expectedHash = "7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331";
  var sha3Hash = Util.sha3('HelloWorld');
  it('should equal expected hash string',
    function() {
      assert.equal(expectedHash, sha3Hash);
    });
});

describe('RLP encoding (string):', function() {
  it('should return itself if single byte and less than 0x7f:', function() {
    var encodedSelf = Util.encodeRLP('a');
    assert.equal(encodedSelf.toString(), 'a');
  });

  it('length of string 0-55 should return (0x80+len(data)) plus data', function() {
    var encodedDog = Util.encodeRLP('dog');
    assert.equal(4, encodedDog.length);
    assert.equal(encodedDog[0], 131);
    assert.equal(encodedDog[1], 100);
    assert.equal(encodedDog[2], 111);
    assert.equal(encodedDog[3], 103);
  });

  it('length of string >55 should return 0xb7+len(len(data)) plus len(data) plus data', function() {
    var encodedLongString = Util.encodeRLP('zoo255zoo255zzzzzzzzzzzzssssssssssssssssssssssssssssssssssssssssssssss');
    assert.equal(72, encodedLongString.length);
    assert.equal(encodedLongString[0], 184);
    assert.equal(encodedLongString[1], 70);
    assert.equal(encodedLongString[2], 122);
    assert.equal(encodedLongString[3], 111);
    assert.equal(encodedLongString[12], 53);
  });
});

describe('RLP encoding (list):', function() {
  it('length of list 0-55 should return (0xc0+len(data)) plus data', function() {
    var encodedArrayOfStrings = Util.encodeRLP(['dog', 'god', 'cat']);
    assert.equal(13, encodedArrayOfStrings.length);
    assert.equal(encodedArrayOfStrings[0], 204);
    assert.equal(encodedArrayOfStrings[1], 131);
    assert.equal(encodedArrayOfStrings[11], 97);
    assert.equal(encodedArrayOfStrings[12], 116);
  });

  it('length of list >55 should return 0xf7+len(len(data)) plus len(data) plus data', function() {
    //need a test case here!
  });
});


describe('RLP encoding (integer):', function() {
  it('length of int = 1, less than 0x7f, similar to string', function() {
    var encodedNumber = Util.encodeRLP(15);
    assert.equal(1, encodedNumber.length);
    assert.equal(encodedNumber[0], 15);
  });
  it('length of int > 55, similar to string', function() {
    var encodedNumber = Util.encodeRLP(1024);
    assert.equal(3, encodedNumber.length);
    assert.equal(encodedNumber[0], 130);
    assert.equal(encodedNumber[1], 4);
    assert.equal(encodedNumber[2], 0);
  });

  it('length of int >55, similar to string', function() {
    //need a test case here!
  });
});

describe('RLP decoding (string):', function() {
  it('first byte < 0x7f, return byte itself', function() {
    var decodedStr = Util.decodeRLP({
      data: new Buffer([97]),
      pos: 0
    }).data;
    assert.equal(1, decodedStr.length);
    assert.equal(decodedStr.toString(), "a");
  });

  it('first byte < 0xb7, data is everything except first byte', function() {
    var decodedStr = Util.decodeRLP({
      data: new Buffer([131, 100, 111, 103]),
      pos: 0
    }).data;
    assert.equal(3, decodedStr.length);
    assert.equal(decodedStr.toString(), "dog");
  });
  it('array', function() {
    var decodedBufferArray = Util.decodeRLP({
      data: new Buffer([204, 131, 100, 111, 103, 131, 103, 111, 100, 131, 99, 97, 116]),
      pos: 0
    }).data;
    assert.deepEqual(Util.formatBufferArray(decodedBufferArray), ["dog", "god", "cat"]);
  });
});

describe('RLP decoding (int):', function() {
  it('first byte < 0x7f, return itself', function() {
    var decodedSmallNum = Util.decodeRLP({
      data: new Buffer([15]),
      pos: 0
    }).data;
    assert.equal(1, decodedSmallNum.length);
    assert.equal(decodedSmallNum[0], 15);
  });

  it('first byte < 0xb7, data is everything except first byte', function() {
    var decodedNum = Util.decodeRLP({
      data: new Buffer([130, 4, 0]),
      pos: 0
    }).data;
    assert.equal(2, decodedNum.length);
    assert.equal(bignum.fromBuffer(decodedNum), 1024);
  });

});

describe('Compact encoding:', function() {
  it('should handle even case.', function() {
    var testBuffer = [1, 2, 3, 4, 5];
    var res = Util.compactEncode(testBuffer).toJSON();
    assert.deepEqual([17, 35, 69], res);
  });

  it('should handle odd case', function() {
    var testBuffer = [0, 1, 2, 3, 4, 5];
    var res = Util.compactEncode(testBuffer).toJSON();
    assert.deepEqual([0, 1, 35, 69], res);
  });

});

describe('Compact hex decoding:', function() {
  it('should decode to hex.', function() {
    var exp = [7, 6, 6, 5, 7, 2, 6, 2, 16];
    var res = Util.compactHexDecode('verb');
    assert.deepEqual(exp, res);
  });

});

describe('Compact decoding:', function() {
  it('should handle even case.', function() {
    var testBuffer = new Buffer([17, 35, 69]);
    var exp = [1, 2, 3, 4, 5];
    var res = Util.compactDecode(testBuffer);
    assert.deepEqual(exp, res);
  });

  it('should handle odd case', function() {
    var testBuffer = new Buffer([0, 1, 35, 69]);
    var exp = [0, 1, 2, 3, 4, 5];
    var res = Util.compactDecode(testBuffer);
    assert.deepEqual(exp, res);
  });

});