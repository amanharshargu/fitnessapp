const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const dashboardController = require("../controllers/dashboardController");

router.get("/user-details", authMiddleware, dashboardController.getUserDetails);
router.get("/calorie-goal", authMiddleware, dashboardController.getCalorieGoal);
router.post("/eaten-dishes", authMiddleware, dashboardController.addEatenDish);
router.get("/eaten-dishes", authMiddleware, dashboardController.getEatenDishes);
router.put(
  "/eaten-dishes/:id",
  authMiddleware,
  dashboardController.editEatenDish
);
router.delete(
  "/eaten-dishes/:id",
  authMiddleware,
  dashboardController.deleteEatenDish
);
router.get("/weekly-calorie-data", authMiddleware, dashboardController.getWeeklyCalorieData);
router.get("/water-intake", authMiddleware, dashboardController.getWaterIntake);
router.post("/water-intake", authMiddleware, dashboardController.addWaterIntake);

module.exports = router;
