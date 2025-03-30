import { generateToken, userModel } from "../models/user.js";
import bcrypt from "bcryptjs";
import mongoose from 'mongoose';
import { achievementModel } from "../models/achievement.js";




// הצגת כל ההישגים
export const getAllAchievements = async (req, res, next) => {
    let page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 12;

    try {
        let allAchievements = await achievementModel.find()
            .skip((page - 1) * perPage)
            .limit(perPage);

        return res.json(allAchievements);
    } catch (err) {
        return res.status(400).json({ type: "invalid operation", message: "Sorry, cannot get achievements" });
    }
}


// הצגת כל ההישגים של משתמש
export const getUserAchievements = async (req, res, next) => {
    let userId = req.params.userId;
    let page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 12;

    try {
        let query = { userId: userId };

        let userAchievements = await achievementModel.find(query)
            .skip((page - 1) * perPage)
            .limit(perPage);

        return res.json(userAchievements);
    } catch (err) {
        return res.status(400).json({ type: "invalid operation", message: "Could not get achievements" });
    }
}


// הוספת הישג
export const addAchievement = async (req, res) => {
    let { userId, title, description, targetDate, category, trackingTable } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ type: "missing parameters", message: "enter title, description, targetDate and category" })
    }

    try {
        const newAchievement = new achievementModel({
            userId: req.user?._id || null,
            title, description, targetDate, category, trackingTable
        });

        const savedAchievement = await newAchievement.save();

        return res.status(201).json(savedAchievement);

    } catch (err) {
        console.error("Error adding order:", err);
        return res.status(500).json({
            type: "server_error", message: "Could not add achievement", error: err.message
        });
    }
}


// עדכון סימון יומי בטבלה
export const updateTrackingTable = async (req, res) => {
    const { id } = req.params;
    const { isMarkedToday } = req.body;

    if (!mongoose.isValidObjectId(id))
        return res.status(400).json({ type: "invalid id", message: "ID format is invalid" });

    if (typeof isMarkedToday !== "boolean")
        return res.status(400).json({ type: "invalid data", message: "isMarkedToday must be a boolean" });

    try {
        let achievement = await achievementModel.findById(id);
        if (!achievement)
            return res.status(404).json({ type: "achievement not found", message: "No achievement found with this ID" });

        achievement.trackingTable.forEach(entry => {
            entry.isMarkedToday = isMarkedToday;
        });

        await achievement.save();

        return res.json(achievement);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ type: "server error", message: "Failed to update achievement" });
    }
}
