var rlp = require('rlp'),
    SHA3 = require('sha3'),
    Transaction = require('./transaction.js'),
    internals = {};

internals.Block = module.exports = function(data) {
    if (data) {
        this.data = this.parseBlock(data);
    }
};

/*
 *Produces a hash the RLP of the block
 *@method hash
 */
internals.Block.prototype.hash = function() {
    var hash = new SHA3.SHA3Hash(256);
    hash.update((rlp.encode(this.serialize())));
    return hash.digest('hex');
};

/*
 * parses a block
 * @method parseBlock
 * @param {Object} data the data to pares
 */
internals.Block.prototype.parseBlock = function(data) {
    //blocks
    this.header = this.parseHeaders(data[0]);
    this.uncleHeaders = [];
    this.transactions = [];
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

internals.Block.prototype.rlpSerialize = function(){
    return rlp.encode(this.serialize());   
};

/*
 *Serializes the hearder to buffer array
 *@method serializeHeader
 */
internals.Block.prototype.serialize = function() {
    var data = [];
    data.push(this.serializeHeader(this.header));
    data.push(new Array);
    data.push(new Array);

    //serialize the transaction
    for(var i = 0; i < this.transactions.length; i++ ){
        data[1].push(this.transactions[i].serialize());
    }

    //serialize the uncle headers
    for (var i = 0; i < this.uncleHeaders.length; i++) {
        data[2].push(this.serializeHeader(this.uncleHeader[i]));
    }

    return data;
};

//parses a block header
internals.Block.prototype.parseHeaders = function(data) {
    return {
        parentHash: data[0],
        sha3UncleList: data[1],
        coinbase: data[2],
        stateRoot: data[3],
        difficulty: data[4],
        sha3transactionList: data[5],
        timestamp: data[6],
        extraData: data[7],
        nonce: data[8]
    };
};



/*
 *Serializes the header to buffer array
 *@method serializeHeader
 */
internals.Block.prototype.serializeHeader = function(header) {
    var data = [];
    data.push(header.parentHash);
    data.push(header.sha3UncleList);
    data.push(header.coinbase);
    data.push(header.stateRoot);
    data.push(header.difficulty);
    data.push(header.sha3transactionList);
    data.push(header.timestamp);
    data.push(header.extraData);
    data.push(header.nonce);
    return data;
};

//parses an array of transactions
internals.parseTxs = function(data) {
    var txs = [];
    for (var i = 1; i < data.length; i++) {
        var rawTx = data[i];
        txs.push({
            nonce: rawTx[0],
            receivingAddress: rawTx[1],
            value: rawTx[2],
            data: rawTx[3],
            v: rawTx[4],
            r: rawTx[5],
            s: rawTx[6]
        });
    }
    return txs;
};
