const userModel = require('../models/userModel')

const userService = {
  createUser: async (user) => {
    try {
      return await userModel.createUser(user)
    } catch (error) {
      throw new Error('Error creating user')
    }
  }
}

module.exports = userService
