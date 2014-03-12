var net = require('net'),
    crypto = require('crypto'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    assert = require('assert'),
    _ = require('underscore'),
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
    this.peers = {};

    //constances, do not redefine
    this.SYNC_TOKEN = '22400891';
    this.CLIENT_ID = "Ethereum Node/0.0.0";
    this.PROTOCOL_VERSION = 0x08; //poc-3
    this.NETWORK_ID = 0;
    this.CAPABILITIES = 0x07;

    //TODO: make a sensible hash
    var hash = crypto.createHash('sha512');
    hash.update((Math.random()).toString());
    this.NODE_ID = hash.digest();

};

util.inherits(internals.Network, EventEmitter);

//start the server
internals.Network.prototype.listen = function(port, host) {

    this.host = host ? host : '0.0.0.0';
    this.port = port ? port : 30303;

    net.createServer(function(sock) {
        var peer = new Peer(sock, this);
        this.peers[peer.uid] = peer;

        sock.on('close', function() {
            delete this.peers[peer.uid];
        }.bind(this));
    }.bind(this)).listen(this.port, this.host);
};

//connect to a peer
internals.Network.prototype.connect = function(port, host, cb) {
    var sock = new net.Socket();
    var self = this;

    sock.on('error', function() {});

    sock.connect(port, host, function() {
        var peer = new Peer(sock, self);
        self.peers[peer.uid] = peer;

        if(_.isFunction(cb)){
            cb();
        }

        sock.on('close', function() {
            console.log('disconnected');
            delete self.peers[peer.uid];
        });
    });

    return sock;
};
