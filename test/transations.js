var Transaction = require('../lib/chain/transaction.js'),
  assert = require('assert');

var transactions = [
  [
    //
    new Buffer('02', 'hex'),
    new Buffer('00', 'hex'),
    new Buffer('0000000000000000000000000000000000000000', 'hex'),
    new Buffer('09184e72a000', 'hex'),
    new Buffer('2710', 'hex'),
    new Buffer('6000', 'hex'),
    new Buffer('6000', 'hex'),
    new Buffer('1b', 'hex'),
    new Buffer('151434d2e1f6e4571419d0f8c2f089c8b70f37ebdcb40e285f54385689e00a8c', 'hex'),
    new Buffer('49484f423fdd7a05980ab89bb24484793a409c51ddc1291f222e69da7257bd87', 'hex'),
  ],
  [
    new Buffer('01', 'hex'),
    new Buffer('00', 'hex'),
    new Buffer('0000000000000000000000000000000000000000', 'hex'),
    new Buffer('09184e72a000', 'hex'),
    new Buffer('2710', 'hex'),
    new Buffer('6000', 'hex'),
    new Buffer('6000', 'hex'),
    new Buffer('1c', 'hex'),
    new Buffer('9942ab0f11963ebacd5399e260c33081e396b65c26b4557081ae3417498af0d0', 'hex'),
    new Buffer('0abe5ad7823f0166af4724b49d3e882b1039c0da64827a8f9d9fa6552be40181', 'hex'),
  ],
  [
    new Buffer('00', 'hex'),
    new Buffer('00', 'hex'),
    new Buffer('0000000000000000000000000000000000000000', 'hex'),
    new Buffer('09184e72a000', 'hex'),
    new Buffer('2710', 'hex'),
    new Buffer('6000', 'hex'),
    new Buffer('6000', 'hex'),
    new Buffer('1b', 'hex'),
    new Buffer('ed835726ad1076f992864fc68426d1edd1021a6bb63b68c4a3e9e99965d961e4', 'hex'),
    new Buffer('0a3a4d64afb06803be42d39fc883992d45331b3ff4989c7ae6596dbcd5722267', 'hex'),
  ]
];


describe('[Transaction]: Basic functions', function () {
  var transaction;

  it('should decode a transaction', function () {
    transaction = new Transaction(transactions[0]);
  });

  it('should serialize a transaction', function () {
    var ser = transaction.serialize();
    assert.deepEqual(ser, transactions[0]);
  });
});