var Winston = require('winston');
exports.error = new(Winston.Logger)({
  transports: [
    new(Winston.transports.Console)(),
    new(Winston.transports.File)({
      filename: '../log/error.log'
    })
  ]
}).error;

exports.info = new(Winston.Logger)({
  transports: [
    new(Winston.transports.Console)(),
    new(Winston.transports.File)({
      filename: '../log/info.log'
    })
  ]
}).info;

exports.warn = new(Winston.Logger)({
  transports: [
    new(Winston.transports.Console)(),
    new(Winston.transports.File)({
      filename: '../log/warn.log'
    })
  ]
}).warn;