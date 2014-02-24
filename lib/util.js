require('buffertools').extend();
var crypto = require('crypto');
var bignum = require('bignum');
var Binary = require('binary');
var _ = require('underscore');

var CryptoJS = require('crypto-js');
var logger = require('./logger');

//================= RLP EN/DECODE =================\\

/**
 * RLP Encoding based on: https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-RLP
 * This function takes in a data, convert it to buffer if not, and a length for recursion
 *
 * @param {Buffer,String,Integer,Array} data - will be converted to buffer
 * @returns {Buffer} - returns buffer of encoded data
 **/
var encodeRLP = exports.encodeRLP = function (data, length) {
  if (data) {
    if (Buffer.isBuffer(data)) {
      var dataBuffer = data,
        dataBufferLen = length || byteLength(dataBuffer),
        buffer = new Buffer(0);
      if (dataBufferLen === 1 && dataBuffer[0] <= 0x7f) {
        return dataBuffer;
      } else if (dataBufferLen < 56) {
        return buffer.concat(hexNumberToBuffer(0x80 + dataBufferLen), dataBuffer);
      } else {
        var lenOfLen = byteLength(dataBufferLen);
        return buffer.concat(hexNumberToBuffer(0xb7 + lenOfLen), hexNumberToBuffer(dataBufferLen), dataBuffer);
      }
    } else if (_.isString(data)) {
      return encodeRLP(new Buffer(data), byteLength(data));
    } else if (_.isNumber(data)) {
      return encodeRLP(bignum(data).toBuffer(), byteLength(data));
    } else if (_.isArray(data)) {
      var combinedDataBuffer = new Buffer(0),
        combinedBuffer = new Buffer(0);
      for (var i in data) {
        combinedDataBuffer = Buffer.concat([combinedDataBuffer, encodeRLP(data[i])]);
      }
      var totalPayload = byteLength(combinedDataBuffer);
      if (totalPayload < 56) {
        return combinedBuffer.concat(hexNumberToBuffer(totalPayload + 0xc0), combinedDataBuffer);
      } else {
        var lenOfLen = byteLength(totalPayload);
        return combinedBuffer.concat(hexNumberToBuffer(lenOfLen + 0xf7), hexNumberToBuffer(totalPayload), combinedDataBuffer);
      }
    }
  } else {
    return hexNumberToBuffer(0x80);
  }
};

/**
 * RLP Decoding based on: {@link https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-RLP|RLP}
 *
 * @param {{data: Buffer, pos: Integer}} - data is buffer array being decoded, pos is the current position [0, len(buff)-1]
 * @returns {Array} - returns decode Array containg the original message
 **/
var decodeRLP = exports.decodeRLP = function (obj) {
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

/**
 * Compact Encoding based on: {@link https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-Patricia-Tree|Patricia Tree}
 * Force the first nibble of the final bytestream to encode two flags,
 * specifying oddness of length (ignoring the 'T' symbol) and terminator
 * status; these are placed, respectively, into the two lowest significant
 * bits of the first nibble. In the case of an even-length hex string, we
 * must introduce a second nibble (of value zero) to ensure the hex-string
 * is even in length and thus is representable by a whole number of bytes
 *
 * @param {Array} dataArr
 * @returns {Buffer} - returns buffer of encoded data
 **/
var compactEncode = exports.compactEncode = function (dataArr) {
  if (_.isArray(dataArr)) {
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

/**
 * Compact Decoding based on: {@link https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-Patricia-Tree|Patricia Tree}
 * First step
 *
 * @param {String|Buffer} str
 * @returns {Array}
 **/
var compactHexDecode = exports.compactHexDecode = function (str) {
  var base = "0123456789abcdef",
    hexArr = [];
  str = stringToHex(str);
  for (var i = 0; i < str.length; i++) {
    hexArr.push(base.indexOf(str[i]));
  }
  hexArr.push(16);

  return hexArr;
};

/**
 * Compact Decoding based on: {@link https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-Patricia-Tree|Patricia Tree}
 *
 * @param {String|Buffer} str
 * @returns {Array}
 **/
var compactDecode = exports.compactDecode = function (str) {
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

/**
 * SHA3 hashing (256 bit version)
 * Wrapper for CryptoJS' implementation
 *
 * @param {String} data
 * @returns {String} - returns the hex string representation
 **/
var sha3 = exports.sha3 = function (data) {
  return CryptoJS.SHA3(data, {
    outputLength: 256
  }).toString();
};

//================= UTIL =================\\

/**
 * Calculates the binary length of anything (hopefully)
 *
 * @param {String|Array|Integer|Buffer} i
 * @returns {Integer} - returns the length of data
 **/
var byteLength = exports.byteLength = function (i) {
  if (Buffer.isBuffer(i)) {
    return i.length;
  } else if (_.isNumber(i)) {
    return i === 0 ? 0 : 1 + byteLength(i >> 8);
  } else if (_.isString(i)) {
    return Buffer.byteLength(i);
  } else if (_.isArray(i)) {
    return i.length;
  }
  return 0;
};

/**
 * Formats the Array of buffer (nested or not) correctly
 *
 * @param {Array} arr
 * @returns {Integer} - returns correct array representation
 **/
var formatBufferArray = exports.formatBufferArray = function (arr) {
  var retArray = [];
  if (_.isArray(arr)) {
    for (var i in arr) {
      if (_.isArray(arr[i])) {
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

/**
 * Change buffer/string to hex string
 *
 * @param {String|Buffer} str
 * @returns {String} - returns the hex string representation
 **/
var stringToHex = exports.stringToHex = function (str) {
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

/**
 * Change hex number to buffer
 *
 * @param {Hex} hex
 * @returns {Buffer} - returns the buffer representation
 **/
var hexNumberToBuffer = exports.hexNumberToBuffer = function (hex) {
  return new Buffer(hex.toString(16), 'hex');
};


//================= TYPE CHECKS =================\\

var isNode = exports.isNode = function (n) {
  return _.isString(n.key) && _.isString(n.val) && _.isBoolean(n.dirty);
};

var isCache = exports.isCache = function (c) {
  return c.nodes && isDB(c.db) && _isBoolean(c.dirty);
};

var isDB = exports.isDB = function (d) {
  return true;
};

var isTrie = exports.isTrie = function (t) {
  return _.isString(t.root) && isCache(t.cache);
};