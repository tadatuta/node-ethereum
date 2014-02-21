require('buffertools').extend();
var crypto = require('crypto');
var bignum = require('bignum');
var Binary = require('binary');
var _ = require('underscore');

var CryptoJS = require('crypto-js');
var logger = require('./logger');

//================= RLP EN/DECODE =================\\

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

var decodeRLP = exports.decodeRLP = function(obj) {
  var buffArr = [];
  var data = obj.data,
    pos = obj.pos;
  if (Buffer.isBuffer(data)) {
    var character = data[pos];
    switch (true) {
      case (character <= 0x7f):
        return {
          data: data,
          pos: pos + 1
        };
      case (character <= 0xb7):
        var len = character - 0x80;
        return {
          data: data.slice(pos + 1, pos + 1 + len),
          pos: pos + 1 + len
        };
      case (character <= 0xbf):
        // console.log("Third case");
        var len = character - 0xb7;
        var lenOfLen = Buffer.byteLength(data.slice(pos + 1, pos + 1 + len));
        return {
          data: data.slice(pos + 1 + len, pos + 1 + len + lenOfLen),
          pos: pos + 1 + len + lenOfLen
        };
      case (character <= 0xf7):
        // console.log("4th case");
        var len = character - 0xc0;
        var prevPos = pos;
        pos++;
        for (var i = 0; i < len;) {
          var tmp = decodeRLP({
            data: data,
            pos: pos
          });
          buffArr.push(tmp.data);
          prevPos = tmp.pos;
          i += (prevPos - pos);
          pos = prevPos;
        }
        return {
          data: buffArr,
          pos: pos
        };
      case (character <= 0xff):
        // console.log("5th case");
        var len = character - 0xf7;
        var lenOfLen = Buffer.byteLength(data.slice(pos + 1, pos + 1 + len));
        pos = pos + len + 1;
        prevPos = lenOfLen;
        for (var i = 0; i < lenOfLen;) {
          var tmp = decodeRLP({
            data: data,
            pos: pos
          });
          buffArr.push(tmp.data);
          prevPos = tmp.pos;
          i += (prevPos - pos);
          pos = prevPos;
        }
        return {
          data: buffArr,
          pos: pos
        };
    }
    return {
      data: buff,
      pos: 0
    };
  } else {
    logger.error('[decodeRLP]: param should be object{ data:Buffer, pos:position }');
  }
};

//================= TRIE EN/DECODING =================\\

var compactEncode = exports.compactEncode = function(dataArr) {
  if (Object.prototype.toString.call(dataArr) === '[object Array]') {
    var terminator = 0;
    var dataArrLen = byteLength(dataArr);
    if (dataArr[dataArrLen - 1] === 16) {
      terminator = 1;
    }
    if (terminator === 1) {
      dataArr.pop();
    }

    var oddlen = dataArrLen % 2;
    var flags = 2 * terminator + oddlen;
    if (oddlen !== 0) {
      dataArr.unshift(flags);
    } else {
      dataArr.unshift(flags, 0);
    }
    var buff = new Buffer(0);
    for (var i = 0; i < byteLength(dataArr); i += 2) {
      buff = Buffer.concat([buff, new Buffer([16 * dataArr[i] + dataArr[i + 1]])]);
    }
    return buff;
  } else {
    logger.error("[compactEncode]: param should be array.");
  }
};

var compactHexDecode = exports.compactHexDecode = function(str) {
  var base = "0123456789abcdef",
    hexArr = [];
  str = toHex(str);
  for (var i = 0; i < str.length; i++) {
    hexArr.push(base.indexOf(str[i]));
  }
  hexArr.push(16);

  return hexArr;
};

var compactDecode = exports.compactDecode = function(str) {
  var base = compactHexDecode(str);
  base.pop();
  if (parseInt(base[0], 10) >= 2) {
    base.push(16);
  }
  if (base[0] % 2 == 1) {
    base = base.slice(1);
  } else {
    base = base.slice(2);
  }

  return base;
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
  } else if (Object.prototype.toString.call(i) === '[object Array]') {
    return i.length;
  }
  return 0;
};

var formatBufferArray = exports.formatBufferArray = function(arr) {
  var retArray = [];
  if (Object.prototype.toString.call(arr) === '[object Array]') {
    for (var i in arr) {
      if (Object.prototype.toString.call(arr[i]) === '[object Array]') {
        retArray.push(formatBufferArray(arr[i]));
      } else if (Buffer.isBuffer(arr[i])) {
        retArray.push(arr[i].toString());
      } else {
        retArray.push(arr[i]);
      }
    }
  }
  return retArray;
};

var toHex = exports.toHex = function(str) {
  var hex = '';

  if (Buffer.isBuffer(str)) {
    hex = '' + str.toString('hex');
  } else {
    for (var i = 0; i < str.length; i++) {
      hex += '' + str.charCodeAt(i).toString(16);
    }
  }
  return hex;
};

//================= TYPE CHECKS =================\\

exports.isNode = function(n) {
  return _.isString(n.key) && _.isString(n.val) && _.isBoolean(n.dirty);
}