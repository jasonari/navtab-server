const userService = require('../services/userService')
const logger = require('../utils/logger')

const userController = {
  setBookmarkList: async (req, res) => {
    try {
      const { username } = req.tokenPayload
      const { bookmarkList } = req.body
      if (!bookmarkList || !username) throw new Error('BookmarkList invalid')
      const result = await userService.setBookmarkListByUsername(
        username,
        bookmarkList
      )
      logger.info(`201 setBookmarkList for ${username}: ${bookmarkList}`)
      res.status(201).json({ code: 201, message: 'Created', data: {} })
    } catch (error) {
      logger.error(`400 setBookmarkList Error: ${error.message}`)
      res.status(400).json({ code: 400, message: error.message, data: {} })
    }
  },

  getBookmarkList: async (req, res) => {
    try {
      const { username } = req.tokenPayload
      const bookmarkList = await userService.getBookmarkListByUsername(username)
      logger.info(`200 getBookmarkList for ${username}`)
      res.status(200).json({ code: 200, message: 'OK', data: { bookmarkList } })
    } catch (error) {
      logger.error(`400 getBookmarkList Error: ${error.message}`)
      res.status(400).json({ code: 400, message: error.message, data: {} })
    }
  }
}

module.exports = userController
