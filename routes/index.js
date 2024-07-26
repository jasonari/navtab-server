const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth.middleware')

/* GET home page. */
router.get('/', authenticateToken, (req, res, next) => {
  res
    .status(200)
    .json({ code: 200, message: '', data: {} })
})

module.exports = router
