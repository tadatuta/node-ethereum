var internals = {};

internals.Transaction = module.exports = function(data) {
    this.parse(data);
};

//parses an array of transactions
internals.Transaction.prototype.parse = function(data) {
    if (data.length == 9) {
        this.type = "message";
        this.recvAddr = data[4];
        this.data = data[5];
    } else if (data.length == 10) {
        this.type = "contract";
        this.o = data[4];
        this.code = data[5];
        this.init = data[6];
    } else {
        throw ('invalid message length');
    }

    this.nonce = data[0];
    this.value = data[1];
    this.gasPrice = data[2];
    this.gas = data[3];

    this.v = data[data.length - 3];
    this.r = data[data.length - 2];
    this.s = data[data.length - 1];
};

internals.Transaction.prototype.encode = function() {
    var encoded = [
        this.nonce,
        this.value,
        this.gasPrice,
        this.gas
    ];

    if (this.type == 'message') {
        encoded.push(this.recvAddr);
        encoded.push(this.data);
    } else {
        encoded.push(this.o);
        encoded.push(this.code);
        encoded.push(this.init);
    }

    encoded.push(this.v);
    encoded.push(this.r);
    encoded.push(this.s);
    return encoded;
};

internals.Transaction.prototype.hash = function(){};
