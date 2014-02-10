require('buffertools').extend();
var crypto = require('crypto');
var bignum = require('bignum');
var Binary = require('binary');
var Winston = require('winston');
var CryptoJS = require('crypto-js');

var encodeRLP = exports.encodeRLP = function(data, length) {
  if (data) {
    if (Buffer.isBuffer(data)) {
      var dataBuffer = data,
        dataBufferLen = length || byteLength(dataBuffer),
        buffer = new Buffer(0);
        if (dataBufferLen === 1 && dataBuffer[0] <= 0x7f) {
        return dataBuffer;
      } else if (dataBufferLen < 56) {
        return buffer.concat(new Buffer((0x80 + dataBufferLen).toString(16), 'hex'), dataBuffer);
      } else {
        var lenOfLen = byteLength(dataBufferLen);
        return buffer.concat(new Buffer((0xb7 + lenOfLen).toString(16), 'hex'), new Buffer(dataBufferLen.toString(16), 'hex'), dataBuffer);
      }
    } else if (typeof data == 'string' || data instanceof String) {
      return encodeRLP(new Buffer(data), byteLength(data));
    } else if (!isNaN(data)) {
      return encodeRLP(bignum(data).toBuffer(), byteLength(data));
    } else if (Object.prototype.toString.call(data) === '[object Array]') {
      var combinedDataBuffer = new Buffer(0),
        combinedBuffer = new Buffer(0);
      for (i in data) {
        combinedDataBuffer = Buffer.concat([combinedDataBuffer, encodeRLP(data[i])]);
      }
      var totalPayload = byteLength(combinedDataBuffer);
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
  if (Buffer.isBuffer(i)) {
    return i.length;
  } else if (!isNaN(i)) {
    if (i === 0) {
      return 0;
    } else {
      return 1 + byteLength(i >> 8);
    }
  } else if (typeof i == 'string' || i instanceof String) {
    return Buffer.byteLength(i);
  }
  return 0;
}

var intToByte