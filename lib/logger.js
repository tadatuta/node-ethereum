var Winston = require('winston');
exports.error = new(Winston.Logger)({
  transports: [
    new(Winston.transports.Console)(),
    new(Winston.transports.File)({
      filename: 'logs/error.log'
    })
  ]
}).error;

exports.info = new(Winston.Logger)({
  transports: [
    new(Winston.transports.Console)(),
    new(Winston.transports.File)({
      filename: 'logs/info.log'
    })
  ]
}).info;

exports.warn = new(Winston.Logger)({
  transports: [
    new(Winston.transports.Console)(),
    new(Winston.transports.File)({
      filename: 'logs/warn.log'
    })
  ]
}).warn;