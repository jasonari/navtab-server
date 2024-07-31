const pool = require('../config/db')

const userModel = {
  createUser: async (user) => {
    const result = await pool.query(
      'INSERT INTO user_data (username,password) VALUES (?,?)',
      [user.username, user.password]
    )
    return result
  }
}

module.exports = userModel
