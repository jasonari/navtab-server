const authService = require('../services/authService')

const authMiddleware = (req, res, next) => {
  const accessToken = req.header('Authorization')?.replace('Bearer ', '')

  if (!accessToken) {
    return res
      .status(401)
      .json({ code: 401, message: 'Invaild token', data: {} })
  }

  try {
    const tokenPayload = authService.verifyAccessToken(accessToken)
    console.log(tokenPayload)
    req.tokenPayload = tokenPayload
    next()
  } catch (err) {
    res
      .status(401)
      .json({ code: 401, message: 'Invalid access-token', data: {} })
  }
}

module.exports = authMiddleware
