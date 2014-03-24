var net = require('net'),
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

    //Register as event emitter
    EventEmitter.call(this);

    //setup defaults
    var optionDefaults = {
        blockchainQuerying: true,
        peerDiscovery: true,
        transactionRelaying: true,
        timeout: 20000, //10 seconds
        maxPeers: 10
    };

    options = options ? options : {};
    _.defaults(options, optionDefaults);
    this.options = options;
    this._peers = {};
    this._peersList = {};
    this._stopping = false;
    this.port = 0;

    this.CAPABILITIES = 0x07;

    //set as const
    Object.defineProperties(this,{
        SYNC_TOKEN: {
            value: "22400891",
            enumerable: true
        },
        CLIENT_ID:{
            value: "Ethereum Node/0.0.2",
            enumerable: true
        },
        PROTOCOL_VERSION:{
            value: 0x08,
            enumerable: true
        },
        NETWORK_ID:{
            value: 0,
            enumerable: true
        }
    });

    //TODO: make a sensible hash
    var hash = crypto.createHash('sha512');
    hash.update((Math.random()).toString());
    this.id = this.NODE_ID = hash.digest('hex');
    this.server = net.createServer(this._onConnect.bind(this));
};

util.inherits(internals.Network, EventEmitter);

//start the server
internals.Network.prototype.listen = function(port, host, cb) {
    var self = this;
    this.ip = this.host = host ? host : '0.0.0.0';
    this.port = port ? port : 30303;
    this.server.listen(this.port, this.host, function() {
        self._listening = true;
        if (_.isFunction(cb)) {
            cb();
        }
    });
};

//connect to a peer
internals.Network.prototype.connect = function(port, host, cb) {
    var socket = new net.Socket();
    var self = this;

    socket.on('error', function(e) {
        //console.log(e);
    });

    socket.connect(port, host, this._onConnect.bind(this, socket, cb));
    return socket;
};

//creates a new peer object and adds it to the peer hash
internals.Network.prototype._onConnect = function(socket, cb) {
    var peer = new Peer(socket, this),
        self = this;

    //since we don't know the peers actully ID we make one up, which is 
    //"internalid". We will update the id after it is sent to us via the hello
    //message
    this._peers[peer.internalId] = peer;

    //disconnect delete peers
    socket.on('close', function() {
        delete self._peers[peer.id];
        delete self._peers[peer.internalId];
        if ((self.getPeersList().length > 0 && self.getPeers()).length < self.options.maxPeers && !self._stopping) {
            self.connect(self._peerList.pop());
        }
    });

    peer.on("message.peers", function(peers) {
        for (var i = 0; i < peers.length; i++) {
            //connect only to peers that are listening and to peers we are not 
            //already connected to
            if (peers[i].port != 0 && !self._peers[peers[i].id]) {
                if ((self.getPeers()).length < self.options.maxPeers) {
                    self.connect(peers[i].port, peers[i].ip);
                } else {
                    //create uid and save to peerlist
                    self._peerList[peer.id] = peers[i];
                }
            }
        }
    });

    //update the id
    peer.once("message.hello", function() {
        //check to make sure we are not already connected
        if (!self._peers[peer.id]) {
            self._peers[peer.id] = self._peers[peer.internalId];
            delete self._peers[peer.internalId];
        } else {
            peer.sendDisconnect(0x05); //already connected
        }
    });

    if (_.isFunction(cb)) {
        cb();
    }
};

//disconnect the peers
//stop listening
internals.Network.prototype.stop = function(cb) {
    var self = this;
    this._stopping = true;
    //disconnect peers
    var peers = this.getPeers();
    async.each(peers, function(peer, cb2) {
        peer.socket.once('end', cb2);
        //0x08 Client quitting.
        peer.sendDisconnect(0x08, function() {
            peer.socket.end();
        });
    }, function() {
        if (self._listening) {
            self.server.close(cb);
            self._listening = false;
        } else if (_.isFunction(cb)) {
            cb();
        }
    });
};

//get a array of ip's and port's of known but not connected to peers
internals.Network.prototype.getPeersList = function() {
    return _.values(this._peerList);
};

//get a array of ip's and port's of known but not connected to peers
internals.Network.prototype.getPeers = function() {
    return _.values(this._peers);
};

//broadcast an array of blocks to the network
internals.Network.prototype.broadcastBlocks = function(blocks, cb) {
    this._broadcast('sendBlocks', blocks, cb);
};

//broadcast an array of transactions to the network
internals.Network.prototype.broadcastTransactions = function(txs, cb) {
    this._broadcast('sendTransactions', txs,  cb);
};

internals.Network.prototype.broadcastGetPeers = function(cb) {
    this._broadcast('sendGetPeers', cb);
};

internals.Network.prototype.broadcastPing = function(cb) {
    this._broadcast('sendPing', cb);
};

internals.Network.prototype.broadcastGetChain = function(parents, count, cb) {
    this._broadcast('sendGetChain', parents, count,  cb);
};

internals.Network.prototype.broadcastGetTransactions = function(cb) {
    this._broadcast('sendGetTransactions',  cb);
};

internals.Network.prototype.broadcastDisconnect = function(reason, cb) {
    this._broadcast('sendDisconnect', reason, cb);
};

/* broadcast messages to the network
 * @method _broadcast
 * @param {String} functionName - one peer's sending functions
 * @param {..} - the argments for the function
 * @param cb - a callback
 */
internals.Network.prototype._broadcast = function(){
    var cb,
        fn = arguments.shift();

    if(_.isFunction(_.last(arguments))){
        cb = arguments.pop();
    }

    var peers = this.getPeers();
    async.each(peers, function(peer, cb2) {
        var  args = arguments.slice();
        args.push(cb2);
        peer[fn].apply(peer, args);
    }, cb);
};
