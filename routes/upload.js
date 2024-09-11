const express = require('express')
const router = express.Router()

const uploadMiddleware = require('../middlewares/uploadMiddleware')
const uploadController = require('../controllers/uploadController')

router.post(
  '/',
  uploadMiddleware.single('image'),
  uploadController.uploadFile,
  (req, res) => {
    console.log('default response')
  }
)

module.exports = router
