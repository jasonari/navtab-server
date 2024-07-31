const jwt = require('jsonwebtoken')
const key = process.env.SECRET_KEY

const authService = {
  generateToken: (user) => {
    return jwt.sign({ username: user.name }, key, { expiresIn: '1h' })
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
