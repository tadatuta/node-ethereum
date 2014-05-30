var Block = require('../lib/chain/block.js'),
  assert = require('assert'),
  //v1
  rawBlock = [
    [
      //parent hash
      new Buffer('6d7c885bf681254fb620487464f2ef973787eee463d2aa076b5c2c7512f96682', 'hex'),
      //uncles hash
      new Buffer('1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347', 'hex'),
      //coinbase
      new Buffer('cf283736915c52b49c75af7d5ff06eaaa32e09a4', 'hex'),
      //stateroot
      new Buffer('450564a58416942429c20c97fdde635ec0ae6531f9c30728812ffa51aaff8d39', 'hex'),
      //transactionTrie
      new Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),
      //difficulty
      new Buffer('408064', 'hex'),
      //number
      new Buffer('0c', 'hex'),
      //nimGasPrice
      new Buffer('09184e72a000', 'hex'),
      //gas Limit
      new Buffer('0f14b3', 'hex'),
      //gas used
      new Buffer('00', 'hex'),
      //time stamp
      new Buffer('53714318', 'hex'),
      //extra data
      new Buffer('00', 'hex'),
      //nonce
      new Buffer('00000000000000000000000000000000000000000000000095339ce6edb6f5b7', 'hex')
    ],
    [],
    []
  ];



describe('[Block]: Basic functions', function () {
  var block;
  it('should parse a block', function () {
    block = new Block(rawBlock);
    //assert(block.header.parentHash.toString('hex') === "e3c3dabf59466a0ec0b3639d2852bd862f01bfaf9c9b4a02df21fc1e3299882b");
  });

  it('should serialize data', function () {
    var raw = block.serialize();
    assert.deepEqual(raw, rawBlock);
  });

  it('should create a hash', function () {
    var hash = block.hash();
  });
});