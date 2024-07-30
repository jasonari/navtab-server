const pool = require('../config/db')

const createUser = async (data) => {
  const [rows] = await pool.query(
    'INSERT INTO user_data (username,password) VALUES (?,?)',
    [data.username, data.password]
  )
  return rows
}

module.exports = { createUser }
