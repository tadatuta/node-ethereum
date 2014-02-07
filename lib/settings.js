var Settings = exports.Settings = function () {
	this.db = {};

	//for livenet & testnet stuff
	this.network = {};

	this.init();
}
Settings.prototype.init =  function() {
  this.homedir = Settings.getDefaultHome();
  this.datadir = '.';
}

Settings.prototype.getDefaultHome = function () {
  //only supports certain OS
  return process.env.HOME + "/.ethereum"; 
};