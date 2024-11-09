const authService = require('../services/authService')
const logger = require('../utils/logger')

const authController = {
  register: async (req, res) => {
    const { username, password } = req.body
    try {
      const uid = await authService.registerUser({ username, password })
      const tokenPayload = { uid, username }
      const tokens = await authService.generateTokens(tokenPayload)
      logger.info(`200 register user: ${username}`)
      res.status(201).json({ code: 200, message: 'Created', data: tokens })
    } catch (error) {
      logger.error(`400 Failed to register: ${error.message}`)
      res.status(400).json({
        code: 400,
        message: 'Failed to create: ' + error.message,
        data: {}
      })
    }
  },

  login: async (req, res) => {
    const { username, password } = req.body
    try {
      const uid = await authService.loginUser({ username, password })
      const tokenPayload = { uid, username }
      const tokens = await authService.generateTokens(tokenPayload)
      logger.info(`200 login user: ${username}`)
      res.status(200).json({ code: 200, message: 'OK', data: tokens })
    } catch (error) {
      if (error.message.includes('ECONNREFUSED')) {
        logger.error(`500 Failed to login: database server connection refused!`)
        res.status(500).json({
          code: 500,
          message: 'Failed to login: ' + error.message,
          data: {}
        })
      } else {
        logger.error(`400 Failed to login: ${error.message}`)
        res.status(400).json({
          code: 400,
          message: 'Failed to login: ' + error.message,
          data: {}
        })
      }
    }
  },

  refreshToken: async (req, res) => {
    const { refreshToken } = req.body
    try {
      const tokenPayload = authService.verifyRefreshToken(refreshToken)
      const tokens = await authService.generateTokens(tokenPayload)
      logger.info(`200 Refresh token`)
      res.status(200).json({ code: 200, message: 'OK', data: tokens })
    } catch (error) {
      logger.error(`400 Failed to refresh token: ${error.message}`)
      res.status(400).json({
        code: 400,
        message: 'Failed to refresh token: ' + error.message,
        data: {}
      })
    }
  }
}

module.exports = authController
