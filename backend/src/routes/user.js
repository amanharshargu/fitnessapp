const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");

router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.put("/update", userController.updateUser);
router.post("/upload-photo", userController.uploadPhoto);

module.exports = router;
