var Network = require('../index.js');
var network = new Network('0.0.0.0');

network.on('message.hello', function(hello){
    console.log(hello);
});

network.on('message.ping', function(){
    console.log('been pinged');
});

network.on('message.pong', function(){
    console.log('got a pong');
});

network.on('message.sendPeer', function(){
    console.log('request to send peers');
});

network.on('message.transaction', function(){
    console.log('got a transaction');
});

network.on('message.blocks', function(){
    console.log('got a block');
});

network.on('message.getChain', function(){
    console.log('requested chain');
});

network.on('message.notInChain', function(){
    console.log('got not in chain');
});

network.on('message.getTransaction', function(){
    console.log('request for transactions');
});

network.listen();
