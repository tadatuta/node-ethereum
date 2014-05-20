var net = require('net'),
  crypto = require('crypto'),
  util = require('util'),
  EventEmitter = require('events')
    .EventEmitter,
  assert = require('assert'),
  _ = require('underscore'),
  async = require('async'),
  Peer = require('./peer'),
  logger = require('../logger.js'),
  internals = {};

exports = module.exports = internals.Network = function (options) {
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
  if (this.options.publicIp) {
    this.ip = this.options.publicIp;
  }

  this.CAPABILITIES = (this.options.blockchainQuerying << 2) +
    (this.options.peerDiscovery << 2) +
    (this.options.transactionRelaying);

  //set as const
  Object.defineProperties(this, {
  SYNC_TOKEN: {
      value: "22400891",
      enumerable: true
    },
    CLIENT_ID: {
      value: "Ethereum Node/0.0.2",
      enumerable: true
    },
    PROTOCOL_VERSION: {
      value: 0x0f,
      enumerable: true
    },
    NETWORK_ID: {
      value: 0,
      enumerable: true
    }
  });

  //TODO: make a sensible hash
  var hash = crypto.createHash('sha512');
  hash.update((Math.random())
    .toString());
  this.id = this.NODE_ID = hash.digest('hex');
  this.server = net.createServer(this._onConnect.bind(this));
};

util.inherits(internals.Network, EventEmitter);

//start the server
internals.Network.prototype.listen = function (port, host, cb) {
  var self = this;
  this.host = host ? host : '0.0.0.0';
  this.port = port ? port : 30303;
  this.server.listen(this.port, this.host, function () {
    self._listening = true;
    if (_.isFunction(cb)) {
      cb();
    }
  });
};

//connect to a peer
internals.Network.prototype.connect = function (port, host, cb) {
  var socket = new net.Socket(),
    self = this;

  if (!_.isFunction(cb)) {
    cb = function () {};
  }

  function onError(e) {
    logger.warn('networking| error  from' + host + ":" + port + "|" + e);
    cb(e);
  }

  function onTimeOut() {
    logger.info('networking| timeout tring to connect to ' + host + ":" + port);
    socket.destroy();
    cb();
  }

  this.emit("connecting", socket, port, host);
  socket.setTimeout(this.options.timeout);
  socket.once('timeout', onTimeOut);
  socket.once('error', onError);
  socket.on('connect', function () {
    socket.removeListener('error', onError);
    socket.removeListener('timeout', onTimeOut);
    self._onConnect(socket);
    cb();
  });
  socket.connect(port, host);
  return socket;
};

//creates a new peer object and adds it to the peer hash
internals.Network.prototype._onConnect = function (socket) {
  //TODO: what about NATs?
  if (!this.ip) {
    this.ip = socket.localAddress;
  }

  var peer = new Peer(socket, this),
    self = this;

  //since we don't know the peers actully ID we make one up, which is 
  //"internalid". 
  this._peers[peer.internalId] = peer;

  //disconnect delete peers
  socket.on('close', function () {
    self.emit("closing", peer);
    delete self._peers[peer.internalId];
    self._popPeerList();
  });

  peer.on("message.peers", function (peers) {
    for (var i = 0; i < peers.length; i++) {
      //connect only to peers that are listening and to peers we are not 
      //already connected to
      if (peers[i].port !== 0 && !self._peers[peers[i].internalId]) {
        //create uid and save to peerlist
        self._peersList[peers[i].internalId] = peers[i];
      }
    }
    self._popPeerList();
  });
};

//disconnect the peers
//stop listening
internals.Network.prototype.stop = function (cb) {
  var self = this;
  this._stopping = true;
  //disconnect peers
  var peers = this.getPeers();
  async.each(peers, function (peer, cb2) {
    peer.socket.once('end', cb2);
    //0x08 Client quitting.
    peer.sendDisconnect(0x08, function () {
      peer.socket.end();
    });
  }, function () {
    if (self._listening) {
      self.server.close(cb);
      self._listening = false;
    } else if (_.isFunction(cb)) {
      cb();
    }
  });
};

//get a array of ip's and port's of known but not connected to peers
internals.Network.prototype.getPeersList = function () {
  return _.values(this._peersList);
};

//get a array of ip's and port's of known but not connected to peers
internals.Network.prototype.getPeers = function () {
  return _.values(this._peers);
};

//broadcast an array of blocks to the network
internals.Network.prototype.broadcastBlocks = function (blocks, cb) {
  this._broadcast('sendBlocks', blocks, cb);
};

//broadcast an array of transactions to the network
internals.Network.prototype.broadcastTransactions = function (txs, cb) {
  this._broadcast('sendTransactions', txs, cb);
};

internals.Network.prototype.broadcastGetPeers = function (cb) {
  this._broadcast('sendGetPeers', cb);
};

internals.Network.prototype.broadcastPing = function (cb) {
  this._broadcast('sendPing', cb);
};

internals.Network.prototype.broadcastGetChain = function (parents, count, cb) {
  this._broadcast('sendGetChain', parents, count, cb);
};

internals.Network.prototype.broadcastGetTransactions = function (cb) {
  this._broadcast('sendGetTransactions', cb);
};

internals.Network.prototype.broadcastDisconnect = function (reason, cb) {
  this._broadcast('sendDisconnect', reason, cb);
};

/* broadcast messages to the network
 * @method _broadcast
 * @param {String} functionName - one peer's sending functions
 * @param {..} - the argments for the function
 * @param cb - a callback
 */
internals.Network.prototype._broadcast = function () {
  var cb,
    fn = arguments.shift();

  if (_.isFunction(_.last(arguments))) {
    cb = arguments.pop();
  }

  var peers = this.getPeers();
  async.each(peers, function (peer, cb2) {
    var args = arguments.slice();
    args.push(cb2);
    peer[fn].apply(peer, args);
  }, cb);
};

/*
 * Pops peers off the peer list and connects to them untill we reach maxPeers
 * or we run out of peer in the peer list
 */
internals.Network.prototype._popPeerList = function () {
  var peersList = this.getPeersList(),
    openSlots = this.options.maxPeers - this.getPeers()
      .length,
    self = this;

  if (peersList.length > 0 && openSlots > 0 && !this._stopping) {
    var peers = peersList.splice(0, openSlots);
    async.each(peers, function (peer, done) {
      delete self._peersList[peer.internalId];
      self.connect(peer.port, peer.ip, done);
    });
  }
};
