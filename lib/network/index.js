var net = require('net'),
    crypto = require('crypto'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    assert = require('assert'),
    Peer   = require('./peer'),
    internals = {};


exports = module.exports = internals.Network = function(host, port, options) {

    assert(this.constructor === internals.Network, 'Network must be instantiated using new');

    // Register as event emitter
    EventEmitter.call(this);

    this.host = host ? host : '127.0.0.1';
    this.port = port ? port : 30303;
    this.peers = {};

    //constances, do not redefine
    this.SYNC_TOKEN = '22400891';
    this.CLIENT_ID = "Ethereum Node/0.0.0";
    this.PROTOCOL_VERSION = 0x07; //poc-3
    this.NETWORK_ID = 0;
    this.CAPABILITIES = 0x07;

    //TODO: make a sensible hash
    var hash = crypto.createHash('sha512');
    hash.update((Math.random()).toString());
    this.NODE_ID = hash.digest();

};

util.inherits(internals.Network, EventEmitter);

//start the server
internals.Network.prototype.listen = function() {

    net.createServer(function(sock){
        var peer = new Peer(sock, this);
        this.peers[peer.uid] = peer;

        sock.on('close',function(){
            delete this.peers[peer.uid];
        }.bind(this));

    }.bind(this)).listen(this.port, this.host);
};
