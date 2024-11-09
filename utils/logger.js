// logger.js
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf, colorize } = format
require('winston-daily-rotate-file')

// define log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`
})

const logger = createLogger({
  level: 'debug',
  transports: [
    new transports.Console({
      level: 'debug',
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      )
    }),
    new transports.DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'info',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat)
    })
  ]
})

module.exports = logger
