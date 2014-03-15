var net = require('net')
crypto = require('crypto'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    assert = require('assert'),
    _ = require('underscore'),
    async = require('async'),
    Peer = require('./peer'),
    internals = {};

exports = module.exports = internals.Network = function(options) {

    assert(this.constructor === internals.Network, 'Network must be instantiated using new');

    // Register as event emitter
    EventEmitter.call(this);

    var optionDefaults = {
        blockchainQuerying: true,
        peerDiscovery: true,
        transactionRelaying: true,
        timeout: 20000, //20 seconds
        maxPeers: 10
    };

    options = options ? options : {};

    _.defaults(options, optionDefaults);
    this.options = options;

    this.port = 0;
    this._peers = {};

    //constances, do not redefine
    this.SYNC_TOKEN = '22400891';
    this.CLIENT_ID = "Ethereum Node/0.0.2";
    this.PROTOCOL_VERSION = 0x08; //poc-3
    this.NETWORK_ID = 0;
    this.CAPABILITIES = 0x07;

    //TODO: make a sensible hash
    var hash = crypto.createHash('sha512');
    hash.update((Math.random()).toString());
    this.NODE_ID = hash.digest();

    this.server = net.createServer(this._onConnect.bind(this));
};

util.inherits(internals.Network, EventEmitter);

//start the server
internals.Network.prototype.listen = function(port, host) {
    var self = this;
    this.host = host ? host : '0.0.0.0';
    this.port = port ? port : 30303;
    this.server.listen(this.port, this.host, function(){
        self._listening = true;
    });
};

//connect to a peer
internals.Network.prototype.connect = function(port, host, cb) {
    var socket = new net.Socket();
    var self = this;

    socket.on('error', function() {
        //do something?
    });
    socket.connect(port, host, this._onConnect.bind(this, socket, cb));
    return socket;
};

//creates a new peer object and adds it to the peer hash
internals.Network.prototype._onConnect = function(socket, cb) {
    var peer = new Peer(socket, this),
        self = this;

    this._peers[peer.uid] = peer;
    socket.on('close', function() {
        delete self._peers[peer.uid];
    });

    if (_.isFunction(cb)) {
        cb();
    }
};

//disconnect the peers
//stop listening
internals.Network.prototype.stop = function(cb) {
    var self = this;
    //disconnect peers
    var peers = this.getPeers();
    async.each(peers, function(peer, cb2) {
        peer.socket.once('end', cb2);
        //0x08 Client quitting.
        peer.sendDisconnect(0x08,function(){
            peer.socket.end();
        });
    }, function() {
        if(self._listening){
            self.server.close(cb);
            self._listening = false;
        }else if(_.isFunction(cb)){
            cb();
        }
    });
};

//get a array of ip's and port's of known but not connected to peers
internals.Network.prototype.getPeersList = function() {
    return this._peerList;
};

//get a array of ip's and port's of known but not connected to peers
internals.Network.prototype.getPeers = function() {
    return _.values(this._peers);
};

//broadcast an array of blocks to the network
internals.Network.prototype.broadcastBlocks = function(blocks, cb) {
    var self = this;
    var peers = this.getPeers();
    async.each(peers, function(peer, cb2) {
        peer.sendBlocks(blocks, cb2);
    }, cb);
};

//broadcast an array of transactions to the network
internals.Network.prototype.broadcastTxs = function(txs, cb) {
    var self = this;
    var peers = this.getPeers();
    async.each(peers, function(peer, cb2) {
        peer.sendTxs(txs, cb2);
    }, cb);
};
