const crypto = require('crypto')
const md5 = crypto.createHash('md5')

function verifyUsers(req, res, next) {
  const { username, password } = req.body
  if (!username || !password) {
    return res
      .status(401)
      .json({ code: 401, message: 'name or password is requied', data: {} })
  }
  next()
}

function encryptPassword(req, res, next) {
  const { password } = req.body
  const cryptoPassword = md5.update(password).digest('hex')
  next()
}

module.exports = { verifyUsers, encryptPassword }
