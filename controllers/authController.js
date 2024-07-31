const authService = require('../services/authService')
const userService = require('../services/userService')

const authController = {
  register: async (req, res) => {
    try {
      const { username, password } = req.body
      const token = authService.generateToken({ username })
    } catch (error) {
      res.status(500).json({ code: 500, message: 'Error register', data: {} })
    }
  }
}
