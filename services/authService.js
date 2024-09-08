const crypto = require('crypto')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const accessKey = process.env.ACCESS_TOKEN_SECRET
const refreshKey = process.env.REFRESH_TOKEN_SECRET
const { v4: uuidv4 } = require('uuid')

const authService = {
  /**
   * registerUser
   * @param {object} user
   * @param {string} user.username
   * @param {string} user.password
   * @returns uid
   */
  registerUser: async (user) => {
    const { username, password } = user
    const uid = uuidv4()
    const hash = crypto.createHash('md5')
    const cryptoPassword = hash.update(password).digest('hex')
    try {
      await userModel.createUser({
        uid,
        username,
        cryptoPassword
      })
      const res = await userModel.getUserByUsername(username)
      return res.uid
    } catch (error) {
      throw new Error(error)
    }
  },

  /**
   * loginUser
   * @param {object} user
   * @param {string} user.username
   * @param {string} user.password
   * @returns uid
   */
  loginUser: async (user) => {
    const { username, password } = user
    const userData = await userModel.getUserByUsername(username)
    if (!userData) throw new Error('User not found')
    const hash = crypto.createHash('md5')
    const cryptoPassword = hash.update(password).digest('hex')
    if (cryptoPassword !== userData.password) {
      throw new Error('Wrong password')
    }
    return userData.uid
  },

  /**
   * generateTokens
   * @param {object} user
   * @param {number} user.uid
   * @param {string} user.username
   * @returns tokens
   */
  generateTokens: async (user) => {
    const { uid, username } = user
    try {
      const userData = await userModel.getUserByUsername(username)
      // user is not banned
      if (userData.is_banned === 0) {
        const accessToken = jwt.sign({ uid, username }, accessKey, {
          expiresIn: '5m'
        })
        const refreshToken = jwt.sign({ uid, username }, refreshKey, {
          expiresIn: '7d'
        })
        return { accessToken, refreshToken }
      }
      throw new Error('User is Banned')
    } catch (error) {
      throw new Error(error.message)
    }
  },

  /**
   * verifyAccessToken
   * @param {string} token
   * @returns tokenPayload
   */
  verifyAccessToken: (token) => {
    try {
      return jwt.verify(token, accessKey)
    } catch (error) {
      throw new Error('Invalid access-token')
    }
  },

  /**
   * verifyRefreshToken
   * @param {string} token
   * @returns tokenPayload
   */
  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, refreshKey)
    } catch (error) {
      throw new Error('Invalid refresh-token')
    }
  }
}

module.exports = authService
