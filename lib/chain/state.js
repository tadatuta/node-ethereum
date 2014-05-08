var Logger = require('../logger');

var state = function (address, amount, nonce, script, initScript) {
  this.address = address || new Buffer('');
  this.amount = amount || 0;
  this.nonce = nonce || 0;
  // Contract attributes
  this.script = script || new Buffer('');
  this.initScript = initScript || new Buffer('');
};


exports = module.exports = state;