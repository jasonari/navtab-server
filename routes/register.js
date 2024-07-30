const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const {
  verifyUsers,
  encryptPassword
} = require('../middleware/user.middleware')

router.post(
  '/register',
  verifyUsers,
  encryptPassword,
  userController.createUser,
  (req, res, next) => {
    res.status(200).json({ code: 200, message: 'register succeed', data: {} })
  }
)

module.exports = router
