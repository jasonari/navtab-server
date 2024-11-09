const dotenv = require('dotenv')
const env = process.env.NODE_ENV || 'development'
dotenv.config({ path: `.env.${env}` })

var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')

const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const uploadRouter = require('./routes/upload')

const logger = require('./utils/logger')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// parse request body
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// http logger
app.use((req, res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`)
  next()
})

// static
app.use(express.static(path.join(__dirname, 'public')))

// router
app.use('/user', userRouter)
app.use('/auth', authRouter)
app.use('/upload', uploadRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`)
  res.status(404).send('404 Not Found')
})

// error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`)
  res.status(500).send('Server Error')
})

module.exports = app
