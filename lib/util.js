require('buffertools').extend();
var crypto = require('crypto');
var bignum = require('bignum');
var Binary = require('binary');
var Winston = require('winston');
var CryptoJS = require('crypto-js');

var encodeRLP = exports.encodeRLP = function(data) {
  if (data) {
      
    // console.log("dataBuffer: " + dataBuffer.toString());
    // console.log("dataBufferLen: " + dataBufferLen.toString())
    // If data is string
    if (typeof data == 'string' || data instanceof String) {
      var dataBuffer = new Buffer(data),
          dataBufferLen = Buffer.byteLength(data),
          buffer = new Buffer(0);

      if (dataBufferLen === 1 && dataBuffer[0] <= 0x7f) {
        return dataBuffer;
      } else if (dataBufferLen < 56) {
        return buffer.concat(new Buffer((0x80 + dataBufferLen).toString(16), 'hex'), dataBuffer);
      } else {
        var lenOfLen = byteLength(dataBufferLen);
        return buffer.concat(new Buffer((0xb7 + lenOfLen).toString(16), 'hex'), new Buffer(dataBufferLen.toString(16), 'hex'), dataBuffer);
      }
      //if data is an array
    } else if (Object.prototype.toString.call(data) === '[object Array]') {
      var combinedDataBuffer = new Buffer(0),
          combinedBuffer = new Buffer(0);
      for (i in data) {
        combinedDataBuffer = Buffer.concat([combinedDataBuffer,encodeRLP(data[i])]);
      }
      var totalPayload = Buffer.byteLength(combinedDataBuffer.toString());
      console.log(totalPayload);
      if (totalPayload < 56) {
        return combinedBuffer.concat(new Buffer((totalPayload + 0xc0).toString(16), 'hex'), combinedDataBuffer);
      } else {
        var lenOfLen = byteLength(totalPayload);
        return combinedBuffer.concat(new Buffer((lenOfLen + 0xf7).toString(16), 'hex'), new Buffer(totalPayload.toString(16), 'hex'), combinedDataBuffer);
      }
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

var byteLength = exports.byteLength = function(i) {
  if (i === 0) {
    return 0
  } else {
    return 1 + byteLength(i >> 8);
  }
}