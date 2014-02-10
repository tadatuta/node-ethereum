var assert = require('assert');
var Util = require('../lib/util');

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

  it('length of data 0-55 should return (0x80+len(data)) plus data', function() {
    var encodedDog = Util.encodeRLP('dog');
    assert.equal(4, encodedDog.length);
    assert.equal(encodedDog[0], 131);
    assert.equal(encodedDog[1], 100);
    assert.equal(encodedDog[2], 111);
    assert.equal(encodedDog[3], 103);
  });
  
  it('length of data >55 should return 0xb7+len(len(data)) plus len(data) plus data', function() {
    var encodedLongString = Util.encodeRLP('zoo255zoo255zzzzzzzzzzzzssssssssssssssssssssssssssssssssssssssssssssss');
    assert.equal(72, encodedLongString.length);
    assert.equal(encodedLongString[0], 184);
    assert.equal(encodedLongString[1], 70);
    assert.equal(encodedLongString[2], 122);
    assert.equal(encodedLongString[3], 111);
    assert.equal(encodedLongString[12], 53)
  });
});

describe('RLP encoding (list):', function() {
  it('length of data 0-55 should return (0xc0+len(data)) plus data', function() {
    var encodedArrayOfStrings = Util.encodeRLP(['dog', 'god', 'cat']);
    assert.equal(13, encodedArrayOfStrings.length);
    assert.equal(encodedArrayOfStrings[0], 204);
    assert.equal(encodedArrayOfStrings[1], 131);
    assert.equal(encodedArrayOfStrings[11], 97);
    assert.equal(encodedArrayOfStrings[12], 116);
  });
  
  it('length of data >55 should return 0xb7+len(len(data)) plus len(data) plus data', function() {
    //need a test case here!
  });
});