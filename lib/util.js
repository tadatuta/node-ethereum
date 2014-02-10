require('buffertools').extend();
var crypto = require('crypto');
var bignum = require('bignum');
var Binary = require('binary');
var Winston = require('winston');
var CryptoJS = require('crypto-js');

var encodeRLP = exports.encodeRLP = function(data) {
  if (data) {
    var dataBuffer = new Buffer(data),
      dataBufferLen = Buffer.byteLength(data),
      buffer;
    console.log("dataBuffer: " + dataBuffer.toString());
    console.log("dataBufferLen: " + dataBufferLen.toString())
    // If data is string
    if (typeof data == 'string' || data instanceof String) {
      if (dataBufferLen === 1 && dataBuffer[0] <= 0x7f) {
        return dataBuffer;
      } else if (dataBufferLen < 56) {
        buffer = new Buffer(0);
        console.log("80 + data len: " + (dataBufferLen + 0x80).toString())
        return buffer.concat(new Buffer((0x80+dataBufferLen).toString(16),'hex'),dataBuffer);
      } else {
        console.log("bignum: "+bignum(dataBufferLen).bitLength());
        buffer = new Buffer(0);
        // buffer.concat((Buffer.byteLength(new Buffer((dataBufferLen ).toString(16), 'hex').toString());
        return buffer.concat(new Buffer(dataBufferLen), dataBuffer);
      }
      //if data is an array
    } else if (Object.prototype.toString.call(data) === '[object Array]') {

    }
  } else {
    return 0x80;
  }
}
var decodeRLP = exports.decodeRLP = function(data) {

}
// 256 bit version
var sha3 = exports.sha3 = function(data) {
  return CryptoJS.SHA3(data, {
    outputLength: 256
  }).toString();
}