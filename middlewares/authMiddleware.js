const authService = require('../services/authService')
const logger = require('../utils/logger')

const authMiddleware = (req, res, next) => {
  const accessToken = req.header('Authorization')?.replace('Bearer ', '')

  if (!accessToken) {
    logger.warn(`401 Unauthorized: ${req.method} ${req.url}`)
    return res
      .status(401)
      .json({ code: 401, message: 'Invaild token', data: {} })
  }

  try {
    const tokenPayload = authService.verifyAccessToken(accessToken)
    req.tokenPayload = tokenPayload
    next()
  } catch (err) {
    logger.error(`401 Invalid access-token`)
    res
      .status(401)
      .json({ code: 401, message: 'Invalid access-token', data: {} })
  }
}

module.exports = authMiddleware
