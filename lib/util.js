require('buffertools').extend();
var crypto = require('crypto');
var bignum = require('bignum');
var Binary = require('binary');
var Winston = require('winston');
var SHA3 = require('sha3');

var encodeRLP = exports.encodeRLP = function(data) {

}

var decodeRLP = exports.decodeRLP = function(data) {

}

var sha3 = exports.sha3 = function(data) {
	var d = new SHA3.SHA3Hash();
	d.update(data);
	d.digest('binary');
	return new Buffer(d, 'binary');
}