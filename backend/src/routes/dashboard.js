const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const dashboardController = require("../controllers/dashboardController");

router.get("/user-details", authMiddleware, dashboardController.getUserDetails);
router.get("/calorie-goal", authMiddleware, dashboardController.getCalorieGoal);


module.exports = router;
