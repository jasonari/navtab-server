const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/authMiddleware')

const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

router.post('/register', authController.register, (req, res) => {
  console.log('default response')
})

router.post('/login', authController.login, (req, res) => {
  console.log('default response')
})

router.get(
  '/getBookmarkList',
  authMiddleware,
  userController.getBookmarkList,
  (req, res) => {
    console.log('default response')
  }
)

router.post(
  '/setBookmarkList',
  authMiddleware,
  userController.setBookmarkList,
  (req, res) => {
    console.log('default response')
  }
)

module.exports = router
