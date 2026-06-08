const express = require('express')
const multer = require('multer')
const path = require('path')
const { requireAdmin } = require('./auth')

const router = express.Router()

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(jpg|jpeg|png|webp|gif|svg|pdf|doc|docx|xls|xlsx|ppt|pptx|dwg|zip|mp4|webm|mov|m4v)$/i.test(file.originalname)
    cb(null, ok)
  },
})

router.post('/', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename })
})

module.exports = router
