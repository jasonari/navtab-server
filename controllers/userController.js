const userService = require('../services/userService')

const userController = {
  createUser: async (req, res) => {
    const { username, password } = req.body
    try {
      const userId = await userService.createUser({ username, password })
      res.status(200).json({ code: 200, message: 'OK', data: { userId } })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        code: 500,
        message: 'Failed to create' + error.message,
        data: {}
      })
    }
  }
}

module.exports = userController
