var bignum = require('bignum');

exports.units = {
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

exports.cost = {
  stepGas: 1,
  balanceGas: 20,
  sha3Gas: 20,
  sloadGas: 20,
  sstoreGas: 100,
  createGas: 100,
  callGas: 20,
  memoryGas: 1,
  txDataGas: 5,
  txGas: 500,
}