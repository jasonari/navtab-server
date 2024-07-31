const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/register', authController.register, (req, res) => {
  res
    .status(200)
    .json({ code: 200, message: 'register router default message', data: {} })
})

module.exports = router
