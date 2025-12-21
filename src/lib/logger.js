const { createLogger, transports, format } = require('winston');

const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),

  format: format.combine(
    format.timestamp(),

    // error stack yakala
    format.errors({ stack: true }),

    // ENV'e göre format
    isProd
      ? format.json() // prod → JSON (ELK / Loki / Datadog)
      : format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
            return `${timestamp} [${level.toUpperCase()}] ${message}\n${stack}`;
          }
          return `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
  ),

  transports: [
    // console her ortamda
    new transports.Console(),

    // prod veya istenirse dev için file log
    new transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),

    new transports.File({
      filename: 'logs/app.log'
    })
  ],

  exitOnError: false
});

module.exports = logger;
