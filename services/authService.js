const crypto = require('crypto')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const key = process.env.JWT_SECRET_KEY
const { v4: uuidv4 } = require('uuid')

const authService = {
  /**
   * registerUser
   * @param {object} user
   * @param {string} user.username
   * @param {string} user.password
   * @returns {number} uid
   */
  registerUser: async (user) => {
    const uid = uuidv4()
    const username = user.username
    const hash = crypto.createHash('md5')
    const cryptoPassword = hash.update(user.password).digest('hex')
    try {
      const id = await userModel.createUser({
        uid,
        username,
        cryptoPassword
      })
      const user = await userModel.getUserByUsername(username)
      console.log(user)
      return user.uid
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
  generateToken: ({ uid, username }) => {
    return jwt.sign({ uid, username }, key, {
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
