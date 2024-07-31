const userService = require('../services/userService')

const userController = {
  createUser: async (req, res) => {
    const { username, password } = req.body
    const user = { username, password }
    try {
      const result = await userService.createUser(user)
      res.status(200).json({ code: 200, message: 'OK', data: { result } })
    } catch (error) {
      res.status(500).json({ code: 500, message: 'Error:' + error, data: {} })
    }
  }
}

module.exports = userController
