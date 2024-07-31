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
      'INSERT INTO user_data (username,password) VALUES (?,?)',
      [user.username, user.cryptoPassword]
    )
    return result[0].insertId
  }
}

module.exports = userModel
