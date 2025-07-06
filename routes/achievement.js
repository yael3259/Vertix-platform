import express from "express";
import { getAllAchievements, addAchievement, addBoost, getUserAchievements, getUserBoosts, updateTrackingTable, getAchievementByUser, getBoostByUser } from "../controllers/achievement.js";
import { auth } from "../auth.js";



const router = express.Router();


router.post("/", auth, addAchievement);
router.post("/boost", auth, addBoost);
router.get("/", getAllAchievements);
router.get("/achievements/:userId", getUserAchievements);
router.get("/boosts/:userId", getUserBoosts);
router.get("/table/:achievementId", auth, getAchievementByUser);
router.get("/boost/:boostId", auth, getBoostByUser);
router.put("/:achievementId", updateTrackingTable);


export default router;