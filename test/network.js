var Network = require('../lib/network/network.js'),
    RLP = require('rlp'),
    net = require('net'),
    assert = require('assert'),
    internals = {
        //test port and host
        port: 4445,
        host: "localhost",
    };

describe("Network listening functions", function() {

    var network = new Network();

    it("should listen", function(done) {
        network.listen(internals.port, internals.host, done);
    });

    it("should stop listening", function(done) {
        network.stop(done);
    });
});

describe("Network connect functions", function() {

    var server;
    var network = new Network();
    var socket;

    it("should connect to a peer", function(done) {
        server = net.createServer();
        server.once('connection', function(sock) {
            socket = sock;
            done();
        });
        server.listen(internals.port, internals.host, function() {
            network.connect(internals.port, internals.host);
        });
    });

    it("should disconnect from peer", function(done) {
        socket.once("close", function() {
            done();
        });
        network.stop();
    });
});

describe("Peer Messages", function(done) {

    var network = new Network(),
        network2 = new Network(),
        peer,
        peer2;

    before(function(done) {
        network2.listen(internals.port + 1, internals.host, done);
    });

    it("should send a hello message on connect", function(done) {
        network.once('message.hello', function(data) {
            done();
        });
        network.connect(internals.port + 1, internals.host);
    });

    it("should store the peer in a hash", function() {
        var peers = network2.getPeers();
        assert(peers.length, 1);
        peer2 = peers[0];
    });

    it("should send a ping", function(done) {
        network.once('message.ping', function() {
            done();
        });
        peer2.sendPing();
    });

    it("should send a pong", function(done) {
        network.once('message.pong', function() {
            done();
        });
        peer = network.getPeers()[0];
        peer.sendPing();
    });

    it("should send get peers", function(done) {
        network.once('message.getPeers', function() {
            done();
        });
        peer2.sendGetPeers();
    });

    it("should send peers", function(done) {
        network.once('message.peers', function() {
            done();
        });
        peer.sendPeers();
    });
});

describe("Message Validation", function(done) {

    var lastData,
    network,
    socket;

    before(function(done) {
        network = new Network();
        socket = new net.Socket();
        network.listen(internals.port + 2, internals.host, done);
    });

    it("should disconnect with reason 0x02 on invalid magic token", function(done) {
        function sendBadSyncToken(socket) {
            var message = [0x00, 0x00]; ///hello
            var BAD_SYNC_TOKEN = '22400892';
            var payload = RLP.encode(message);
            var len = new Buffer(4);
            len.writeUInt32BE(payload.length, 0);
            var formatedPayload = Buffer.concat([new Buffer(BAD_SYNC_TOKEN, 'hex'), len, payload]);
            socket.write(formatedPayload);
        }

        socket.on('data', function(data) {
            lastData = data;
        });

        socket.on("connect", function() {
            sendBadSyncToken(socket);
        });

        socket.on("close", function() {
            assert.equal(lastData.toString('hex'), '2240089100000003c20102');
            done();
        });
        socket.connect(internals.port + 2, internals.host);
    });
});
