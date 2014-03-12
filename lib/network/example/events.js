var Network = require('../index.js');
var network = new Network();

network.on('message', function(payload){
   // console.log(payload);
});

network.on('message.hello', function(peer, hello, payload){
    console.log("hello");   
});

network.on('message.ping', function(){
    console.log('been pinged');
});

network.on('message.pong', function(){
    console.log('got a pong');
});

network.on('message.getPeers', function(){
    console.log('request to send peers');
});

network.on('message.peers', function(peer, peers, payload){
    console.log('got peers');
    console.log(peers);
});

network.on('message.transaction', function(){
    console.log('got a transaction');
});

network.on('message.blocks', function(){
    console.log('got a block');
});

network.on('message.getChain', function(peer, message, payload){
    console.log("get chian");
});

network.on('message.notInChain', function(){
    console.log('got not in chain');
});

network.on('message.getTransactions', function(){
    console.log('request for transactions');
});

network.listen();
network.connect( 30303, "66.49.191.123");
