/*
 * This implements the logic for core network functionality
 */

exports.logic = function(peer) {
    //send hello right away
    peer.sendHello();

    peer.on("message", function(payload, data) {
        //check sync token
        if (this.network.SYNC_TOKEN != data.slice(0, 4).toString('hex')) {
            //Bad protocol
            peer.sendDisconnect(0x02);
        }
        //No other messages may be sent until a Hello is received
        if (payload[0][0] !== 0x00 && payload[0][0] !== undefined) {
            if (!peer._state.hello) {
                //Bad protocol
                peer.sendDisconnect(0x02);
            }
        }
    });

    peer.on("message.hello", function() {
        //wait 2 seconds and get peers from this peer
        //we should only get one hello message
        this._state.hello = true;
        setTimeout(peer.sendGetPeers.bind(peer), 200);
    });

    peer.on("message.ping", function() {
        peer.sendPong();
    });

    peer.on("message.getPeers", function() {
        peer.sendPeers();
    });

    peer.on("message.peers", function(peers) {
        for (var i = 0; i < peers.length; i++) {
            if ((this.network.getPeers()).length < this.network.options.maxPeers) {
                this.network.connect(peers[i].port, peers[i].ip);
            } else {
                //create uid and save to peerlist
                var uid = peers[i].ip + ":" + peers[i].port;
                this.network._peerList[uid] = peers[i];
            }
        }
    });

    peer.on("message.disconnect", function() {
        peer.socket.end();
    });
};
