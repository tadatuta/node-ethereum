var bignum = require('bignum');

var units = exports.units = {
  wei: {
    value: bignum(1),
    unit: "Wei"
  },
  szabo: {
    value: bignum.pow(10, 12),
    unit: "Szabo"
  },
  finney: {
    value: bignum.pow(10, 15),
    unit: "Finney"
  },
  ether: {
    value: bignum.pow(10, 18),
    unit: "Ether"
  }
};