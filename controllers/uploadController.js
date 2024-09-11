const uploadController = {
  uploadFile: (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ code: 400, message: 'No file uploaded', data: {} })
    }

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
