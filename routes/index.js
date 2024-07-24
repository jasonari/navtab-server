var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  const resData = { code: 200, message: 'OK', data: {} }
  res.status(200).json(resData)
})

module.exports = router
