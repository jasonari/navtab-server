const pool = require('../config/db')

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
    const result = await pool.query(
      'INSERT INTO user_data (uid,username,password) VALUES (?,?,?)',
      [user.uid, user.username, user.cryptoPassword]
    )
    return result[0]
  },

  /**
   * getUserByUsername
   * @param {string} username
   * @returns {Promise<object>} user
   */
  getUserByUsername: async (username) => {
    const [rows] = await pool.query(
      'SELECT * FROM user_data WHERE username = ?',
      [username]
    )
    return rows[0]
  },

  /**
   * setBookmarkListByUsername
   * @param {string} username
   * @param {string} bookmarkListStr
   * @returns
   */
  setBookmarkListByUsername: async (username, bookmarkListStr) => {
    const result = await pool.query(
      'UPDATE user_data SET bookmark_list = ? WHERE username = ?',
      [bookmarkListStr, username]
    )
    console.log(result)
    return result[0]
  },

  /**
   * getBookmarkListByUsername
   * @param {string} username
   * @returns {Promise<Array>} bookmarkList
   */
  getBookmarkListByUsername: async (username) => {
    const [rows] = await pool.query(
      'SELECT bookmark_list FROM user_data WHERE username = ?',
      [username]
    )
    return rows[0].bookmark_list
  }
}

module.exports = userModel
