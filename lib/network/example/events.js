var Network = require('../index.js');
var network = new Network('0.0.0.0');

network.on('message', function(payload){
   // console.log(payload);
});

network.on('message.hello', function(peer, hello, payload){
    
    console.log(hello);
    console.log("getting chain");
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

network.on('message.peers', function(){
    console.log('request to send peers');
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
network.connect( 30303, "192.168.56.1");
