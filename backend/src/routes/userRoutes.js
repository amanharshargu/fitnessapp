const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { updateUser, uploadPhoto } = require('../controllers/userController');

router.put('/update', updateUser);
router.post('/upload-photo', upload.single('photo'), uploadPhoto);

module.exports = router;
