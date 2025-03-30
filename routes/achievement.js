import express from "express";
import { getAllAchievements, addAchievement, getUserAchievements, updateTrackingTable } from "../controllers/achievement.js";



const router = express.Router();


router.post("/", addAchievement);
router.get("/", getAllAchievements);
router.get("/:userId", getUserAchievements);
router.put("/:id", updateTrackingTable);


export default router;