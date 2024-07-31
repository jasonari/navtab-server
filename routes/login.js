const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/login', authController.login, (req, res) => {
  res
    .status(200)
    .json({ code: 200, message: 'login router default msg', data: {} })
})

module.exports = router
