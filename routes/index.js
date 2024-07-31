const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')

/* GET home page. */
router.get('/', authMiddleware, (req, res) => {
  res
    .status(200)
    .json({ code: 200, message: 'root router default msg', data: {} })
})

module.exports = router
