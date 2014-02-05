require('buffertools').extend();
var crypto = require('crypto');
var bignum = require('bignum');
var Binary = require('binary');
var Winston = require('winston');
var CryptoJS = require('crypto-js');

var encodeRLP = exports.encodeRLP = function(data) {

}

var decodeRLP = exports.decodeRLP = function(data) {

}
// 256 bit version
var sha3 = exports.sha3 = function(data) {
    return CryptoJS.SHA3(data, {
        outputLength: 256
    }).toString();
}