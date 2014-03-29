#!/usr/bin/env node

var Ethereum = require('../'),
    Network = Ethereum.Network,
    internals = {};

internals.network = new Network();

internals.network.on('message.hello', function(hello, payload) {
    console.log("hello from:" + hello.clientId);
    console.log("at:" + hello.ip + " port:" + hello.port);
});

internals.network.on('message.transactions', function(transactions) {
    console.log('got a transactions');
    console.log(transactions);
    //TODO: check if transaction is in the DB
    //check if the transaction is valid
    //push tx to txlist
    //save in db
});

internals.network.on('message.blocks', function(blocks) {
    console.log('got a block');
    //TODO: check if block is in DB
});

internals.network.on('message.getChain', function() {
    console.log("get chian");
});

internals.network.on('message.notInChain', function() {
    console.log('got not in chain');
});

internals.network.on('message.getTransactions', function() {
    console.log('request for transactions');
});

internals.network.on('message.disconnect', function(message) {
    console.log(message);
});

internals.network.listen(30303, "0.0.0.0");
//internals.network.connect(30303, "54.201.28.117");
