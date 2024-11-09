const logger = require('../utils/logger')

const uploadController = {
  uploadFile: (req, res) => {
    if (!req.file) {
      logger.error(`400 No file uploaded`)
      return res
        .status(400)
        .json({ code: 400, message: 'No file uploaded', data: {} })
    }

    logger.info(`201 upload filename: ${req.file.filename}`)
    res.status(201).json({
      code: 201,
      message: 'Created',
      data: {
        imagePath: `/${req.file.filename}`
      }
    })
  }
}

module.exports = uploadController
