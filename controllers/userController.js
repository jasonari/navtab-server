const userModel = require('../models/userModel')

const createUser = async (req, res) => {
  const { username, password } = req.body
  const userData = { username, password }
  try {
    const result = await userModel.createUser(userData)
    res.status(200).json({ code: 200, message: 'OK', data: { result } })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ code: 500, message: 'Failed to create user:' + error, data: {} })
  }
}

module.exports = { createUser }
