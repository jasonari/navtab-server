const jwt = require('jsonwebtoken')
const accessKey = process.env.JWT_ACCESS_KEY

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res
      .status(401)
      .json({ code: 401, message: 'Invaild token', data: {} })
  }

  try {
    req.tokenPayload = jwt.verify(token, accessKey)
    console.log(req.tokenPayload)
    next()
  } catch (err) {
    res.status(401).json({ code: 401, message: 'Invalid token', data: {} })
  }
}

module.exports = authMiddleware
