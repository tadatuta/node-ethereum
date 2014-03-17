var Network = require('../lib/network/network.js');
var net = require('net');
var assert = require('assert');
var network = new Network();
var network2 = new Network();

//test port and host
var port = 4445;
var host = "localhost";

var port2 = 22223;
var host2 = "localhost";

describe("Network listening functions", function() {

    it("should listen", function(done) {
        network.listen(port, host);
            done();
    });

    it("should stop listening", function(done) {
        network.stop(done);
    });
});

describe("Network connect functions", function() {
    var server = null;
    var socket = null;
    var listenPort = 3333;

    it("should connect to a peer", function(done) {
        server = net.createServer();
        server.once('connection', function(sock){
            socket = sock;
            done();
        });
        server.listen(port, host, function() {
            network.connect(port, host);
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
    before(function(){
    
        network = new Network();
        network2 = new Network();
        network2.listen(port + 1, host);
    
    });

    it("should send a hello message on connect", function(done) {
        network.on('message.hello', function(data) {
            done();
        });
        network.connect(port + 1, host);
    });

    it("should store the peer in a hash", function() {
        var peers = network2.getPeers();
        assert(peers.length, 1);
    });
});
