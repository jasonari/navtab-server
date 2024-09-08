const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')

router.post('/refreshToken', authController.refreshToken, (req, res) => {
  console.log('default response')
})

module.exports = router
