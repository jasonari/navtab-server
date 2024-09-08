const userModel = require('../models/userModel')

const userService = {
  /**
   * setBookmarkListByUsername
   * @param {string} username
   * @param {Array} bookmarkList
   * @returns
   */
  setBookmarkListByUsername: async (username, bookmarkList) => {
    const bookmarkListStr = JSON.stringify(bookmarkList)
    const result = await userModel.setBookmarkListByUsername(
      username,
      bookmarkListStr
    )
    return result
  },

  /**
   * getBookmarkListByUsername
   * @param {string} username
   * @returns bookmarkList
   */
  getBookmarkListByUsername: async (username) => {
    const result = await userModel.getBookmarkListByUsername(username)
    return result
  }
}

module.exports = userService
