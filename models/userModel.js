const pool = require('../config/db')

const userModel = {
  /**
   * createUser 创建用户
   * @param {object} user
   * @param {string} user.username
   * @param {string} user.cryptoPassword
   * @returns {number} insertId
   */
  createUser: async (user) => {
    const result = await pool.query(
      'INSERT INTO user_data (uid,username,password) VALUES (?,?,?)',
      [user.uid, user.username, user.cryptoPassword]
    )
    return result[0].insertId
  },

  /**
   * getUserByUsername
   * @param {string} username
   * @returns {object} user
   */
  getUserByUsername: async (username) => {
    const [rows] = await pool.query(
      'SELECT * FROM user_data WHERE username = ?',
      [username]
    )
    return rows[0]
  },

  /**
   *
   * @param {String} username
   * @param {String} bookmarkListStr
   * @returns
   */
  setBookmarkListByUsername: async (username, bookmarkListStr) => {
    const result = await pool.query(
      'UPDATE user_data SET bookmark_list = ? WHERE username = ?',
      [bookmarkListStr, username]
    )
    return result[0]
  }
}

module.exports = userModel
