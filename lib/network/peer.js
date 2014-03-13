var util = require('util'),
    assert = require('assert'),
    EventEmitter = require('events').EventEmitter,
    RLP = require('rlp'),
    internals = {};

internals.PROTOCOL_VERSION = {
    0x00: "PoC-1",
    0x01: "PoC-2",
    0x07: "PoC-3",
    0x08: "PoC-4"
};

internals.DISCONNECT_REASON = {
    0x00: "Disconnect requested",
    0x01: "TCP sub-system error",
    0x02: "Bad protocol",
    0x03: "Useless peer",
    0x04: "Too many peers",
    0x05: "Already connected",
    0x06: "Wrong genesis block",
    0x07: "Incompatible network protocols",
    0x08: "Client quitting"
};

/*
 * @contructor
 * @param {Object} socket an Intialized Sockets. MUST alread be connected
 * @param {Object} network the network that initailized the connection
 */
exports = module.exports = internals.Peer = function(socket, network) {

    // Register as event emitter
    EventEmitter.call(this);

    this.socket = socket;
    this.network = network;

    //the state of the peer
    this._state = {
        hello: false, //has the handshake took place?
        waiting: false //are we wait for a response?
    };

    //create a uid for internall book keeping
    this.uid = socket.remoteAddress + ":" + socket.remotePort;
    socket.on('data', this._onData.bind(this));

    //send the handshake
    this.sendHello();
};

util.inherits(internals.Peer, EventEmitter);

/*
 * formats packets as a 4-byte synchronisation token (0x22400891), a 4-byte
 * "payload size", to be interpreted as a big-endian integer and finally an 
 * N-byte RLP-serialised data structure, where N is the aforementioned 
 * "payload size". 
 * @method sendMessage
 * @param {Object} message a the message that is being sent
 * @param {Function} cb a callback function
 */
internals.Peer.prototype.sendMessage = function(message, cb) {
    var payload = RLP.encode(message);
    var len = new Buffer(4);
    len.writeUInt32BE(payload.length, 0);
    var formatedPayload = Buffer.concat([new Buffer(this.network.SYNC_TOKEN, 'hex'), len, payload]);
    var self = this;
    this.socket.write(formatedPayload, cb);
};

/*
 * Sends the hello message
 * @method sendHello 
 */
internals.Peer.prototype.sendHello = function(cb) {
    var message = [
        null,
        this.network.PROTOCOL_VERSION,
        null, this.network.CLIENT_ID,
        this.network.CAPABILITIES,
        this.network.port,
        this.network.NODE_ID
    ];

    this.sendMessage(message, cb);
};

/*
 * Inform the peer that a disconnection is imminent
 * @method sendDisconnect
 * @param {Number} reason
 * @param {Function} cb
 */
internals.Peer.prototype.sendDisconnect = function(reason, cb) {
    this.sendMessage([0x01, reason], cb);
};

/*
 * Requests an immediate reply of Pong from the peer
 * @method sendPing
 * @param {Function} cb
 */
internals.Peer.prototype.sendPing = function(cb) {
    this.sendMessage([0x02], cb);
};


/*
 * Reply to peer's Ping packet 
 * @method sendPong
 * @param {Function} cb
 */
internals.Peer.prototype.sendPong = function(cb) {
    this.sendMessage([0x03], cb);
};

/*
 * Request the peer to enumerate some known peers for us to connect to. This
 * should include the peer itself.
 * @method sendGetPeers
 * @param {Function} cb
 */
internals.Peer.prototype.sendGetPeers = function(cb) {
    this.sendMessage([0x10], cb);
};

/*
 * Specifies a number of known peers 
 * @method sendPeers
 * @param {Function} cb
 */
internals.Peer.prototype.sendPeers = function(peers, cb) {
    this.sendMessage([0x11], cb);
};


/*
 * Specify (a) transaction(s) that the peer should make sure is included on its
 * transaction queue. 
 * @method sendTransactions
 * @param {Function} cb
 */
internals.Peer.prototype.sendTransactions = function(transactions, cb) {
    this.sendMessage([0x12], cb);
};

/*
 * Specify (a) block(s) that the peer should know about.  
 * @method sendBlocks
 * @param {Function} cb
 */
internals.Peer.prototype.sendBlocks = function(blocks, cb) {
    this.sendMessage([0x13], cb);
};

/*
 * Request the peer to send Count (to be interpreted as an integer) blocks in
 * the current canonical block chain that are children of Parent1
 * @method sendGetChain
 * @param {Function} cb
 */
internals.Peer.prototype.sendGetChain = function(parents, count, cb) {
    this.sendMessage([0x14, 0x10], cb);
};

/*
 * Tell the peer that the given hash was not found in its block chain.
 * @method sendNotInChain
 * @param {Function} cb
 */
internals.Peer.prototype.sendNotInChain = function(cb) {
    this.sendMessage([0x15], cb);
};

/*
 * Request the peer to send all transactions currently in the queue
 * @method sendGetTransactions
 * @param {Function} cb
 */
internals.Peer.prototype.sendGetTransactions = function(cb) {
    this.sendMessage([0x16], cb);
};

internals.Peer.prototype._onData = function(data) {

    assert.equal(this.network.SYNC_TOKEN, data.slice(0, 4).toString('hex'), "invalid synchronisation token");
    var payloadLen = parseInt(data.slice(4, 8).toString('hex'), 16);
    var payload = RLP.decode(data.slice(8, payloadLen + 8));

    this.network.emit("message", payload, data);

    //No other messages may be sent until a Hello is received
    if (payload[0][0] !== 0x00 && payload[0][0] !== undefined) {
        if (!this._state.hello) {
            //Bad protocol
            this.sendDisconnect(0x02);
        }
    }

    switch (payload[0][0]) {
        case undefined:
        case 0x00:
            //hello
            //build hello message
            var binaryCaps = payload[4][0].toString(2),
                capabilities = {
                    blockchainQuerying: binaryCaps[0] === '1',
                    peerDiscovery: binaryCaps[1] === '1',
                    transactionRelaying: binaryCaps[2] === '1'
                },
                hello = {
                    protocolVersion: internals.PROTOCOL_VERSION[payload[1][0]],
                    networkId: payload[2].toString(),
                    clientId: payload[3].toString(),
                    capabilities: capabilities,
                    port: payload[5].toString('hex'),
                    nodeId: payload[6].toString('hex'),
                    ip: this.socket.remoteAddress
                };

            this.network.emit("message.hello", this, hello, payload, data);
            this.emit("message.hello", hello, payload, data);

            //wait 2 seconds and get peers from this peer
            //we should only get one hello message
            setTimeout(this.sendGetPeers.bind(this), 200);
           
            this._state.hello = true;

            break;

        case 0x01:
            //disconnect
            var message = {
                reason: internals.DISCONNECT_REASON[payload[1]]
            };

            this.network.emit("message.disconnect", this, message, payload, data);
            this.emit("message.disconnect", message, payload, data);
            this.socket.end();
            break;
        case 0x02:
            //ping
            this.sendPong();
            this.network.emit("message.ping", this, {}, payload, data);
            this.emit("message.ping", {}, payload, data);
            break;
        case 0x03:
            //pong
            this.network.emit("message.pong", this, {}, payload, data);
            this.emit("message.pong", {}, payload, data);
            break;
        case 0x10:
            //get peers
            this.network.emit("message.getPeers", this, {}, payload, data);
            this.emit("message.getPeers", {}, payload, data);
            this.sendPeers();
            break;
        case 0x11:
            //peers
            var message = [];
            
            //connect to new peers
            //while (Object.keys(this.network.peers).length < this.network.options.maxPeers) {
            //    this.network.connect()
            //}

            //format message
            for (var i = 1; i < payload.length; i++) {
                var peer = payload[i];
                message.push({
                    ip: peer[0][0][0] + "." + peer[0][1][0] + "." + peer[0][2][0] + "." + peer[0][3][0],
                    port: peer[1].readInt16BE(0),
                    id: peer[2].toString('hex'),
                });

                if (Object.keys(this.network.peers).length < this.network.options.maxPeers) {
                    this.network.connect();
                }
            }
            this.network.emit("message.peers", this, message, payload, data);
            this.emit("message.peers", message, payload, data);
            break;

        case 0x12:
            //transactions
            this.network.emit("message.transactions", this, {}, payload, data);
            this.emit("message.transactions", {}, payload, data);
            break;

        case 0x13:
            //blocks
            var blocks = payload[1];
            for (var i = 0; i < blocks.length; i++) {

            }
            this.network.emit("message.blocks", this, {}, payload, data);
            this.emit("message.blocks", {}, payload, data);
            break;

        case 0x14:
            //get chain
            var message = {
                parents: []
            };

            for (var i = 1; i < payload.length - 1; i++) {
                message.parents.push(payload[i]);
            }

            message.count = payload.length - 1;

            this.network.emit("message.getChain", this, message, payload, data);
            this.emit("message.getChain", message, payload, data);
            break;

        case 0x15:
            //not in chain
            this.network.emit("message.notInChain", this, {}, payload, data);
            this.emit("message.notInChain", {}, payload, data);
            break;

        case 0x16:
            //get transactions
            this.network.emit("message.getTransactions", this, {}, payload, data);
            this.emit("message.getTransactions", {}, payload, data);
            this.sendTransactions();
            break;

        default:
            socket.end();
            break;
    }
}
