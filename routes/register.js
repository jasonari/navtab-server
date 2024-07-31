const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.post('/register', userController.createUser, (req, res) => {
  res
    .status(200)
    .json({ code: 200, message: 'register router default message', data: {} })
})

module.exports = router
