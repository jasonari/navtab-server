const crypto = require('crypto')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const key = process.env.JWT_SECRET_KEY

const authService = {
  /**
   * registerUser
   * @param {object} user
   * @param {string} user.username
   * @param {string} user.password
   * @returns {number} userId
   */
  registerUser: async (user) => {
    const username = user.username
    const hash = crypto.createHash('md5')
    const cryptoPassword = hash.update(user.password).digest('hex')
    try {
      const userId = await userModel.createUser({ username, cryptoPassword })
      return userId
    } catch (error) {
      throw new Error(error)
    }
  },

  /**
   * loginUser
   * @param {object} user
   * @param {string} username
   * @param {string} password
   * @returns {number} id
   */
  loginUser: async ({ username, password }) => {
    const user = await userModel.getUserByUsername(username)
    console.log(user)
    if (!user) throw new Error('User not found')
    const hash = crypto.createHash('md5')
    const cryptoPassword = hash.update(password).digest('hex')
    if (cryptoPassword !== user.password) {
      throw new Error('Wrong password')
    }
    return user.id
  },

  /**
   * generateToken
   * @param {object} user
   * @param {number} user.id
   * @param {string} user.username
   * @returns {string} token
   */
  generateToken: ({ id, username }) => {
    return jwt.sign({ id, username }, key, {
      expiresIn: '1h'
    })
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, key)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
}

module.exports = authService
