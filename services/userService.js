const userModel = require('../models/userModel')
const crypto = require('crypto')

const userService = {
  /**
   * createUser
   * @param {object} user
   * @param {string} user.username
   * @param {string} user.password
   * @returns {number} userId
   */
  createUser: async (user) => {
    const username = user.username
    const hash = crypto.createHash('md5')
    const cryptoPassword = hash.update(user.password).digest('hex')
    try {
      const userId = await userModel.createUser({ username, cryptoPassword })
      return userId
    } catch (error) {
      throw new Error(error)
    }
  }
}

module.exports = userService
