const express = require('express');
const multer = require('multer');
const wasteController = require('../controllers/wasteController');
const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'), false);
        }
    }
});

router.post('/classify', upload.single('wasteImage'), wasteController.classifyWaste);

module.exports = router;
