var rlp = require('rlp'),
  SHA3 = require('sha3'),
  Transaction = require('./transaction.js'),
  internals = {};

internals.Block = module.exports = function (data) {
  this.header = {};
  if (data) {
    this.data = this.parseBlock(data);
  }
  this._childHash = null;
  this._inBlockChain = false;
};

/*
 *Produces a hash the RLP of the block
 *@method hash
 */
internals.Block.prototype.hash = function () {
  var hash = new SHA3.SHA3Hash(256);
  hash.update((rlp.encode(this.serialize())));
  return hash.digest('hex');
};

/*
 * parses a block
 * @method parseBlock
 * @param {Object} data the data to parses
 */
internals.Block.prototype.parseBlock = function (data) {
  //blocks
  this.header = this.parseHeaders(data[0]);
  this.uncleHeaders = [];
  this.transactionManifest = [];
  var rawUncleHeaders = data[2],
    rawTransactions = data[1];

  //parse uncle headers
  for (var i = 0; i < rawUncleHeaders.length; i++) {
    this.uncleHeaders.push(this.parseHeaders(rawUncleHeaders[i]));
  }

  //parse uncle headers
  for (var i = 0; i < rawTransactions.length; i++) {
    this.transactions.push(new Transaction(rawTransactions[i]));
  }
};

internals.Block.prototype.rlpSerialize = function () {
  return rlp.encode(this.serialize());
};

/*
 *Serializes the hearder to buffer array
 *@method serializeHeader
 */
internals.Block.prototype.serialize = function () {
  var data = [];
  data.push(this.serializeHeader(this.header));
  data.push(new Array);
  data.push(new Array);

  //serialize the transaction
  for (var i = 0; i < this.transactions.length; i++) {
    data[1].push(this.transactions[i].serialize());
  }

  //serialize the uncle headers
  for (var i = 0; i < this.uncleHeaders.length; i++) {
    data[2].push(this.serializeHeader(this.uncleHeader[i]));
  }
  return data;
};

//parses a block header
internals.Block.prototype.parseHeaders = function (data) {
  return {
    parentHash: data[0],
    uncleHash: data[1],
    coinbase: data[2],
    stateRoot: data[3],
    transactionsTrie:data[4],
    difficulty: data[5],
    timestamp: data[6],
    number: data[7],
    minGasPrice: data[8],
    gasLimit: data[9],
    gasUsed: data[10],
    extraData: data[11],
    nonce: data[12]
  };
};

/*
 *Serializes the header to buffer array
 *@method serializeHeader
 */
internals.Block.prototype.serializeHeader = function (header) {
  var data = [];
  data.push(header.parentHash);
  data.push(header.uncleHash);
  data.push(header.coinbase);
  data.push(header.stateRoot);
  data.push(header.transactionsTrie);
  data.push(header.difficulty);
  data.push(header.timestamp);
  data.push(header.number);
  data.push(header.minGasPrice);
  data.push(header.gasLimit);
  data.push(header.gasUsed);
  data.push(header.extraData);
  data.push(header.nonce);
  return data;
};

internals.Block.prototype.inBlockchain = function () {
  return this._inBlockChain;
};

internals.Block.prototype.getChildHash = function(){
  return this._childHash;
};
