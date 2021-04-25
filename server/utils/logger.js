const winston = require('winston');

winston.configure({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      level: 'silly'
    })
  ]
});

module.exports = winston;
