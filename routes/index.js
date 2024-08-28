const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

/* GET home page. */
router.get('/', authMiddleware, (req, res) => {
  console.log('default response')
})

router.post('/user/register', authController.register, (req, res) => {
  console.log('default response')
})

router.get(
  '/user/getBookmarkList',
  authMiddleware,
  userController.getBookmarkList,
  (req, res) => {
    console.log('default response')
  }
)

router.post(
  '/user/setBookmarkList',
  authMiddleware,
  userController.setBookmarkList,
  (req, res) => {
    console.log('default response')
  }
)

module.exports = router
