const authService = require('../services/authService')

const authController = {
  register: async (req, res) => {
    const { username, password } = req.body
    try {
      const uid = await authService.registerUser({ username, password })
      const token = await authService.generateToken({ uid, username })
      res.status(200).json({ code: 200, message: 'OK', data: { token } })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        code: 500,
        message: 'Failed to create' + error.message,
        data: {}
      })
    }
  },

  login: async (req, res) => {
    const { username, password } = req.body
    try {
      const uid = await authService.loginUser({ username, password })
      const token = await authService.generateToken({ uid, username })
      res.status(200).json({ code: 200, message: 'OK', data: { token } })
    } catch (error) {
      console.error(error)
      res.status(401).json({
        code: 401,
        message: 'Failed to login: ' + error.message,
        data: {}
      })
    }
  }
}

module.exports = authController
