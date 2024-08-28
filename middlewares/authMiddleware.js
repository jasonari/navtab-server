const jwt = require('jsonwebtoken')
const key = process.env.JWT_SECRET_KEY

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ code: 401, message: 'Invaild token' })
  }

  try {
    req.tokenPayload = jwt.verify(token, key)
    console.log(req.tokenPayload)
    next()
  } catch (err) {
    res.status(401).json({ code: 401, message: 'Invalid token' })
  }
}

module.exports = authMiddleware
