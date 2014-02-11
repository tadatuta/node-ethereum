require('buffertools').extend();
var crypto = require('crypto');
var bignum = require('bignum');
var Binary = require('binary');
var CryptoJS = require('crypto-js');
var logger = require('./logger');

//================= EN/DECODE =================\\

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
      for (var i in data) {
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
};

var decodeRLP = exports.decodeRLP = function(data, pos) {
  if (Buffer.isBuffer(data)) {
    var character = data[pos];
    switch (true) {
      case (character <= 0x7f):
        return data;
      case (character <= 0xb7):
        var len = character - 0x80;
        return data.slice(pos + 1, pos + 1 + len);
        // case char <= 0xbf:
        //   var len = character - 0xb7

        //   b2: = ReadVarint(bytes.NewReader(data[pos + 1: pos + 1 + b]))

        //   return data[pos + 1 + b: pos + 1 + b + b2],
        //     pos + 1 + b + b2

        //   case char <= 0xf7:
        //     b: = uint64(data[pos]) - 0xc0
        //     prevPos: = pos
        //     pos++
        //   for i: = uint64(0);
        //   i < b; {
        //     var obj interface {}

        //     // Get the next item in the data list and append it
        //     obj, prevPos = Decode(data, pos)
        //     slice = append(slice, obj)

        //     // Increment i by the amount bytes read in the previous
        //     // read
        //     i += (prevPos - pos)
        //     pos = prevPos
        //   }
        //   return slice, pos

        // case char <= 0xff:
        //   l: = uint64(data[pos]) - 0xf7
        //   //b := BigD(data[pos+1 : pos+1+l]).Uint64()
        //   b: = ReadVarint(bytes.NewReader(data[pos + 1: pos + 1 + l]))

        //   pos = pos + l + 1

        //   prevPos: = b
        //   for i: = uint64(0);
        //   i < uint64(b); {
        //     var obj interface {}

        //     obj, prevPos = Decode(data, pos)
        //     slice = append(slice, obj)

        //     i += (prevPos - pos)
        //     pos = prevPos
        //   }
        //   return slice, pos
    }
  } else {
    logger.error('[debugRLP]: only takes in buffer objects');
  }
};

//================= HASHING =================\\


// 256 bit version
var sha3 = exports.sha3 = function(data) {
  return CryptoJS.SHA3(data, {
    outputLength: 256
  }).toString();
};

//================= UTIL =================\\


var byteLength = exports.byteLength = function(i) {
  if (Buffer.isBuffer(i)) {
    return i.length;
  } else if (!isNaN(i)) {
    return i === 0 ? 0 : 1 + byteLength(i >> 8);
  } else if (typeof i == 'string' || i instanceof String) {
    return Buffer.byteLength(i);
  }
  return 0;
};