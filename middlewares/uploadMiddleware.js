const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // save file in images
    cb(null, path.join(__dirname, '../public/images'))
  },
  filename: (req, file, cb) => {
    // unique file name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  )
  const mimeType = allowedTypes.test(file.mimetype)

  if (extname && mimeType) {
    cb(null, true)
  } else {
    cb(new Error('Only images are allowed'))
  }
}

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
})

module.exports = uploadMiddleware
