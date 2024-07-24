const jwt = require('jsonwebtoken')
const SECRET_KEY = '1D756D50BE2BD43291839343F1AC441E'

const userList = [{ uid: '001', userName: 'Jason' }]

function register() {
  const { username, password } = req.body
  // registe
}

function login(req, res) {
  const { username, password } = req.body
  // search
  const user = userList.find((item) => {
    return item.userName == username
  })
  // invalid user
  if (!user) {
    return res.status(401).send('Invalid User')
  }
  // token
  const token = jwt.sign({ uid: user.uid }, SECRET_KEY, { expiresIn: '1h' })
  res.status(200).json({ code: 200, message: 'OK', data: { token } })
}

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .json({ code: 401, message: 'Access denied', data: {} })
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ code: 403, message: 'Invalid token', data: {} })
    req.uid = decoded.uid
    next()
  })
}

module.exports = { login, authenticateToken }
