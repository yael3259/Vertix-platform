import express from "express";
import { getAllAchievements, addAchievement, getUserAchievements, updateTrackingTable, getAchievementByUser } from "../controllers/achievement.js";
import { auth } from "../auth.js";



const router = express.Router();


router.post("/", auth, addAchievement);
router.get("/", getAllAchievements);
router.get("/achievements/:userId", getUserAchievements);
// router.get("/table", auth, getTrackingTablesByUser);
router.get("/table/:achievementId", auth, getAchievementByUser);
router.put("/:achievementId", updateTrackingTable);


export default router;