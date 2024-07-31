const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', (req, res) => {
  res
    .status(200)
    .json({ code: 200, message: 'root router default msg', data: {} })
})

module.exports = router
