var rlp = require('rlp'),
    internals = {};

internals.Block = module.exports = function(data) {
    if (data) {
        this.data = this.parseBlock(data);
    }
};

internals.Block.prototype.hash = function() {
    sha3(rlp(this.encode));
};

internals.Block.prototype.parseBlock = function(data) {
    //blocks
    var block = data[i],
        rawUncleHeaders = block[0],
        uncleHeaders = [];

    //parse uncle headers
    for (var i = 0; i < rawUncleHeaders.length; i++) {
        uncleHeaders.push(internals.parseHeaders(rawUncleHeaders[i]));
    }

    message.push({
        header: internals.parseHeader(block[0]),
        transactionList: internals.parseTxs(block[1]),
        uncleList: uncleHeaders
    });

    return message;
};


//parses a block header
internals.parseHeaders = function(data) {
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
