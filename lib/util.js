require('buffertools').extend();
var Binary = require('binary');
var _ = require('underscore');
var Sha3 = require('sha3');
var Logger = require('./logger');

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
      dataArrLen = byteLength(dataArr);
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
  } else if (_.isString(dataArr)) {
    return compactEncode(toCharArray(dataArr));
  } else {
    Logger.error("[compactEncode]: param should be array.");
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
 * Wrapper for keccak-hash library
 *
 * @param {String} data
 * @returns {String} - returns the hex string representation
 **/

var sha3 = exports.sha3 = function (buffer) {
  var hash = new Sha3.SHA3Hash(256);
  hash.update(buffer);
  return hash.digest('hex');
}

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

/**
 * String to char array, using split/map for optimal perf
 * http://jsperf.com/string-tochararray
 *
 * @param {String} s
 * @returns {Array} - returns the char array representation
 **/
var toCharArray = exports.toCharArray = function (s) {
  return s.split("").map(function (char) {
    return char.charCodeAt(0);
  });
};

/**
 *
 * Deep equal wrapper of underscore
 *
 * @param {Object} obj
 * @param {Object} other
 * @returns {Boolean} - returns whether the deep equal check of two object
 **/
var deepEqual = exports.deepEqual = _.isEqual;

/**
 *
 * isEmpty wrapper of underscore
 *
 * @param {Object} obj
 * @returns {Boolean} - returns if the object is empty
 **/
var isEmpty = exports.isEmpty = _.isEmpty;

/**
 *
 * size wrapper of underscore
 *
 * @param {Object} obj
 * @returns {Boolean} - returns the sizde of the object
 **/
var size = exports.size = _.size;

/**
 *
 * Longest Prefix for two arrays of integers
 *
 * @param {Array} first
 * @param {Array} second
 * @returns {Integer} - returns the longest matching prefix
 **/
var longestPrefix = exports.longestPrefix = function (first, second) {
  var prefix = 0,
    i, j;
  if (first.length < second.length) {
    for (i = 0; i < first.length; i++) {
      if (_.isEqual(first[i], second[i])) {
        prefix++;
      } else {
        return prefix;
      }
    }
  } else {
    for (i = 0; i < second.length; i++) {
      if (_.isEqual(first[i], second[i])) {
        prefix++;
      } else {
        return prefix;
      }
    }
  }
  return prefix;
};

/**
 *
 * Fills an array of given length with empty string
 *
 * @param {Integer} l - length
 * @returns {Array} - returns the empty string filled array
 **/
var emptyStringArray = exports.emptyStringArray = function (l) {
  return new Array(l).join(' ').split(' ');
};

//================= TYPE CHECKS =================\\

var isNode = exports.isNode = function (n) {
  return _.isString(n.key) && (Buffer.isBuffer(n.val) || _.isString(n.val) || _.isArray(n.val) || _.isNumber(n.val)) && _.isBoolean(n.dirty);
};

var isCache = exports.isCache = function (c) {
  return c.nodes && isDB(c.db) && _.isBoolean(c.dirty);
};

var isDB = exports.isDB = function (d) {
  return true;
};

var isTrie = exports.isTrie = function (t) {
  return _.isString(t.root) && isCache(t.cache);
};