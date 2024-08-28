const userModel = require('../models/userModel')

const userService = {
  /**
   *
   * @param {String} username
   * @param {JSON} bookmarkList
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
   *
   * @param {String} username
   * @returns bookmarkList
   */
  getBookmarkListByUsername: async (username) => {
    const result = await userModel.getBookmarkListByUsername(username)
    return result
  }
}

module.exports = userService
