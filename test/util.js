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

describe('RLP encoding:', function() {
  // var expected1 = new Buffer([ 0x83, 'd', 'o', 'g' ]);
  it('should return itself if single byte and less than 0x7f:', function() {
    var encodedSelf = Util.encodeRLP('a');
    assert.equal(encodedSelf.toString(), 'a');
  });

  it('length of data 0-55 should return (0x80+len(data)) plus data', function() {
    var encodedDog = Util.encodeRLP('dog');
    // console.log(encodedDog.toString());
    // console.log(encodedDog.length);
    // console.log(encodedDog[0].toString());
    // console.log(encodedDog[1].toString());
    // console.log(encodedDog[2].toString());
    // console.log(encodedDog[3].toString());
    assert.equal(4, encodedDog.length);
    assert.equal(encodedDog[0], 131);
    assert.equal(encodedDog[1], 100);
    assert.equal(encodedDog[2], 111);
    assert.equal(encodedDog[3], 103);
  });
  
  it('length of data >55 should return 0xb7+len(len(data)) plus len(data) plus data', function() {
    //need a test case here!
  });
});