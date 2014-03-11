var RLP = require('rlp'),
    assert = require('assert'),
    internals = {};


const PROTOCOL_VERSION = {
    0x00: "PoC-1",
    0x01: "PoC-2",
    0x07: "PoC-3"
};

const DISCONNECT_REASON = {
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

exports = module.exports = internals.Peer = function(sock, network) {
    this.sock = sock;
    this.network = network;
    //the start of the peer
    this.state = {
        hello: false, //has the handshake took place
        waiting: false //are we wait for a response?
    };

    //create a uid for internall book keeping
    this.uid = sock.remoteAddress + ":" + sock.remotePort;
    sock.on('data', this._onData.bind(this));
};

internals.Peer.prototype.sendMessage = function(message, cb) {
    var payload = RLP.encode(message);
    var len = new Buffer(4);
    len.writeUInt32BE(payload.length, 0);
    var formatedPayload = Buffer.concat([new Buffer(this.network.SYNC_TOKEN, 'hex'), len, payload]);
    this.sock.write(formatedPayload, cb);
};

/*
 * Sends the hello message
 * @method sendHello 
 */
internals.Peer.prototype.sendHello = function() {
    var message = [
        null,
        this.network.PROTOCOL_VERSION,
        null, this.network.CLIENT_ID,
        this.network.CAPABILITIES,
        this.network.port,
        this.network.NODE_ID
    ];
    
    var self = this;
    this.sendMessage(message, function() {
        self.state.hello = true;
    });
};

/*
 * Inform the peer that a disconnection is imminent
 * @method sendDisconnect
 * @param {Number} reason
 */
internals.Peer.prototype.sendDisconnect = function(reason) {
    this.sendMessage([0x01, reason]);
};

/*
 * Requests an immediate reply of Pong from the peer
 * @method sendPing
 */
internals.Peer.prototype.sendPing = function() {
    this.sendMessage([0x02]);
};


/*
 * Reply to peer's Ping packet 
 * @method sendPong
 */
internals.Peer.prototype.sendPong = function() {
    this.sendMessage([0x03]);
};

/*
 * Request the peer to enumerate some known peers for us to connect to. This
 * should include the peer itself.
 * @method sendGetPeers
 */
internals.Peer.prototype.sendGetPeers = function() {
    this.sendMessage([0x10]);
};

/*
 * Specifies a number of known peers 
 * @method sendPeers
 */
internals.Peer.prototype.sendPeers = function() {
    this.sendMessage([0x11]);
};


/*
 * Specify (a) transaction(s) that the peer should make sure is included on its
 * transaction queue. 
 * @method sendTransactions
 */
internals.Peer.prototype.sendTransactions = function() {
    this.sendMessage([0x12]);
};

/*
 * Specify (a) block(s) that the peer should know about.  
 * @method sendBlocks
 */
internals.Peer.prototype.sendBlocks = function() {
    this.sendMessage([0x13]);
};

/*
 * Request the peer to send Count (to be interpreted as an integer) blocks in
 * the current canonical block chain that are children of Parent1
 * @method sendGetChain
 */
internals.Peer.prototype.sendGetChain = function() {
    this.sendMessage([0x14]);
};

/*
 * Tell the peer that the given hash was not found in its block chain.
 * @method sendNotInChain
 */
internals.Peer.prototype.sendNotInChain = function() {
    this.sendMessage([0x15]);
};

/*
 * Request the peer to send all transactions currently in the queue
 * @method sendGetTransactions
 */
internals.Peer.prototype.sendGetTransactions = function() {
    this.sendMessage([0x16]);
};


internals.Peer.prototype._onData = function(data) {

    assert.equal(this.network.SYNC_TOKEN, data.slice(0, 4).toString('hex'), "invalid synchronisation token");
    var payloadLen = parseInt(data.slice(4, 8).toString('hex'), 16);
    var payload = RLP.decode(data.slice(8, payloadLen + 8));

    this.network.emit("message", payload, data);

    //No other messages may be sent until a Hello is received
    if(payload[0][0] !== 0x00 && payload[0][0] !== undefined ){
        if(!this.state.hello){
           //Bad protocol
           this.sendDisconnect(0x02);
        }
    }

    switch (payload[0][0]) {
        //hello
        case undefined:
        case 0x00:

            var binaryCaps = payload[4][0].toString(2);
            var capabilities = {
                blockchainQuerying: binaryCaps[0] === '1',
                peerDiscovery: binaryCaps[1] === '1',
                transactionRelaying: binaryCaps[2] === '1'
            };

            var hello = {
                protocolVersion:  PROTOCOL_VERSION[payload[1][0]],
                networkId: payload[2].toString(),
                clientId: payload[3].toString(),
                capabilities: capabilities,
                port: payload[5].toString('hex'),
                nodeId: payload[6].toString('hex')
            };

            this.network.emit("message.hello", hello);
            this.sendHello();
            break;

        case 0x01:
            //disconnect
            this.network.emit("message.disconnect", {reason: DISCONNECT_REASON[payload[1]]});
            sock.end();
            break;
        case 0x02:
            //ping
            this.network.emit("message.ping");
            this.sendPong();
            break;
        case 0x03:
            //pong
            this.network.emit("message.pong");
            break;
        case 0x10:
            //get peers
            this.network.emit("message.sendPeers");
            this.sendPeers();
            break;
        case 0x11:
            //peers
            this.network.emit("message.peers");
            console.log("peers");
            break;
        case 0x12:
            //transactions
            this.network.emit("message.transaction");
            break;
        case 0x13:
            //blocks
            this.network.emit("message.blocks");
            break;
        case 0x14:
            //get chain
            this.network.emit("message.getChain");
            break;
        case 0x15:
            //not in chain
            this.network.emit("message.notInChain");
            break;
        case 0x16:
            //get transactions
            this.network.emit("message.getTransactions");
            this.sendTransactions();
            break;
        default:
            sock.end();
            break;
    }
}
