const express = require('express')
const router = express.Router()
const {
  verifyUsers,
  encryptPassword,
} = require('../middleware/user.middleware')

router.post('/register', verifyUsers, encryptPassword, (req, res, next) => {
  res.status(200).json({ code: 200, message: 'register succeed', data: {} })
})

module.exports = router
