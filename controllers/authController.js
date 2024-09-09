const authService = require('../services/authService')

const authController = {
  register: async (req, res) => {
    const { username, password } = req.body
    try {
      const uid = await authService.registerUser({ username, password })
      const tokenPayload = { uid, username }
      const tokens = await authService.generateTokens(tokenPayload)
      res.status(201).json({ code: 200, message: 'Created', data: tokens })
    } catch (error) {
      console.error(error)
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
      res.status(200).json({ code: 200, message: 'OK', data: tokens })
    } catch (error) {
      console.error(error)
      res.status(400).json({
        code: 400,
        message: 'Failed to login: ' + error.message,
        data: {}
      })
    }
  },

  refreshToken: async (req, res) => {
    const { refreshToken } = req.body
    try {
      const tokenPayload = authService.verifyRefreshToken(refreshToken)
      const tokens = await authService.generateTokens(tokenPayload)
      res.status(200).json({ code: 200, message: 'OK', data: tokens })
    } catch (error) {
      console.error(error)
      res.status(400).json({
        code: 400,
        message: 'Failed to refresh token: ' + error.message,
        data: {}
      })
    }
  }
}

module.exports = authController
