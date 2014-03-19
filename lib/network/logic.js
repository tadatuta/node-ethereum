/*
 * This implements the logic for the Peers
 */

exports.logic = function(peer) {
    //send hello right away
    peer.sendHello();
    
    //if the peer doesn't responsed with the alloted timeout, disconnect it
    var timeout =  setTimeout(function(){
        peer.sendDissconnect();
    }, peer.network.options.timeout);

    peer.on("message", function(payload, data) {
        clearTimeout(timeout);

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

    peer.on("message.disconnect", function() {
        peer.socket.end();
    });
};
