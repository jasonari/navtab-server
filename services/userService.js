const userModel = require('../models/userModel')
const logger = require('../utils/logger')

const userService = {
  /**
   * setBookmarkListByUsername
   * @param {string} username
   * @param {Array} bookmarkList
   * @returns
   */
  setBookmarkListByUsername: async (username, bookmarkList) => {
    try {
      const bookmarkListStr = JSON.stringify(bookmarkList)
      const result = await userModel.setBookmarkListByUsername(
        username,
        bookmarkListStr
      )
      return result
    } catch (error) {
      logger.debug(
        `UserService setBookmarkListByUsername Error: ${error.message}`
      )
      throw error
    }
  },

  /**
   * getBookmarkListByUsername
   * @param {string} username
   * @returns bookmarkList
   */
  getBookmarkListByUsername: async (username) => {
    try {
      const result = await userModel.getBookmarkListByUsername(username)
      return result
    } catch (error) {
      logger.debug(
        `UserService getBookmarkListByUsername Error: ${error.message}`
      )
      throw error
    }
  }
}

module.exports = userService
