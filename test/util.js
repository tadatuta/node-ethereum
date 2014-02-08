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