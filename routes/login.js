const express = require('express')
const router = express.Router()
const { generateToken } = require('../middleware/auth.middleware')

router.post('/login', generateToken, (req, res, next) => {
  res.status(200).json({ code: 200, message: '', data: {} })
})

module.exports = router
