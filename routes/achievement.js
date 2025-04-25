import express from "express";
import { getAllAchievements, addAchievement, getUserAchievements, updateTrackingTable, createTrackingTable } from "../controllers/achievement.js";



const router = express.Router();


router.post("/", addAchievement);
router.get("/", getAllAchievements);
router.get("/:userId", getUserAchievements);
router.post("/table", createTrackingTable);
router.put("/:achievementId", updateTrackingTable);


export default router;