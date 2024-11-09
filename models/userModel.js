const pool = require('../config/db')
const logger = require('../utils/logger')

const userModel = {
  /**
   * createUser
   * @param {object} user
   * @param {string} user.uid
   * @param {string} user.username
   * @param {string} user.cryptoPassword
   * @returns {Promise<number>} insertId
   */
  createUser: async (user) => {
    try {
      const result = await pool.query(
        'INSERT INTO user_data (uid,username,password) VALUES (?,?,?)',
        [user.uid, user.username, user.cryptoPassword]
      )
      logger.info(`MySQL createUser: ${user.username}`)
      return result[0]
    } catch (error) {
      logger.debug(`MySQL Error in createUser: ${error.message}`)
      throw error
    }
  },

  /**
   * getUserByUsername
   * @param {string} username
   * @returns {Promise<object>} user
   */
  getUserByUsername: async (username) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM user_data WHERE username = ?',
        [username]
      )
      logger.info(`MySQL getUserByUsername: ${username}`)
      return rows[0]
    } catch (error) {
      logger.debug(`MySQL Error in getUserByUsername: ${error.message}`)
      throw error
    }
  },

  /**
   * setBookmarkListByUsername
   * @param {string} username
   * @param {string} bookmarkListStr
   * @returns
   */
  setBookmarkListByUsername: async (username, bookmarkListStr) => {
    try {
      const result = await pool.query(
        'UPDATE user_data SET bookmark_list = ? WHERE username = ?',
        [bookmarkListStr, username]
      )
      logger.info(`MySQL setBookmarkListByUsername: ${username}`)
      return result[0]
    } catch (error) {
      logger.debug(`MySQL Error in setBookmarkListByUsername: ${error.message}`)
      throw error
    }
  },

  /**
   * getBookmarkListByUsername
   * @param {string} username
   * @returns {Promise<Array>} bookmarkList
   */
  getBookmarkListByUsername: async (username) => {
    try {
      const [rows] = await pool.query(
        'SELECT bookmark_list FROM user_data WHERE username = ?',
        [username]
      )
      logger.info(`MySQL getBookmarkListByUsername: ${username}`)
      return rows[0].bookmark_list
    } catch (error) {
      logger.debug(`MySQL Error in getBookmarkListByUsername: ${error.message}`)
      throw error
    }
  }
}

module.exports = userModel
