import { generateToken, userModel } from "../models/user.js";
import bcrypt from "bcryptjs";
import mongoose from 'mongoose';
import { achievementModel } from "../models/achievement.js";
import cron from 'node-cron';




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
};


// הצגת כל ההישגים של משתמש
export const getUserAchievements = async (req, res) => {
    let userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ type: "not valid id", message: "ID is not the right format" });
    }

    try {
        let userAchievements = await achievementModel.find({ userId });

        return res.json(userAchievements);

    } catch (err) {
        return res.status(400).json({ type: "invalid operation", message: "Could not get achievements" });
    }
};


// הוספת הישג
export const addAchievement = async (req, res) => {
    let { title, description, targetDate, category, shouldCreatePost } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ type: "not valid id", message: "ID is not the right format" });
    }

    if (!title || !description || !category || !targetDate) {
        return res.status(400).json({ type: "missing parameters", message: "enter title, description, targetDate and category" });
    }

    try {
        const trackingTable = createTrackingTable(new Date(), new Date(targetDate));

        let newAchievement = new achievementModel({
            title,
            description,
            targetDate,
            category,
            trackingTable,
            isCompleted: false,
            statusTable: 'in-progress',
            userId: userId
        });

        const savedAchievement = await newAchievement.save();
        return res.status(201).json({ savedAchievement, shouldCreatePost: shouldCreatePost });

    } catch (err) {
        console.error("Error adding achievement:", err);
        return res.status(500).json({ type: "server_error", message: "Could not add achievement", error: err.message });
    }
};


// פונקציה ליצירת טבלת מעקב
export const createTrackingTable = (startDate, endDate) => {
    const days = [];
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        days.push({
            day: new Date(current),
            isMarkedToday: false,
            isCompleted: false
        });
        current.setDate(current.getDate() + 1);
    }
    return days;
};


// עדכון סימון יומי בטבלה
export const updateTrackingTable = async (req, res) => {
    const { achievementId } = req.params;
    const { isMarkedToday } = req.body;

    if (!mongoose.isValidObjectId(achievementId))
        return res.status(400).json({ type: "invalid id", message: "ID format is invalid" });

    if (typeof isMarkedToday !== "boolean")
        return res.status(400).json({ type: "invalid data", message: "isMarkedToday must be a boolean" });

    try {
        let achievement = await achievementModel.findById(achievementId);
        if (!achievement)
            return res.status(404).json({ type: "achievement not found", message: "No achievement found with this ID" });

        let today = new Date();
        today.setHours(0, 0, 0, 0);

        let todayEntry = achievement.trackingTable.find(entry =>
            new Date(entry.day).getTime() === today.getTime()
        );

        if (!todayEntry)
            return res.status(404).json({ type: "not found", message: "Today not found in tracking table" });

        todayEntry.isMarkedToday = isMarkedToday;

        await achievement.save();

        return res.json(achievement);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ type: "server error", message: "Failed to update achievement" });
    }
};


// Cron Job לריצה יומית בחצות
cron.schedule("0 0 * * *", async () => {
    // cron.schedule("*/5 * * * * *", async () => {
    console.log("Daily Cron initialized");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const achievements = await achievementModel.find();

        for (let achievement of achievements) {
            const achievementOfUser = achievement.userId;

            // חיפוש היום הנוכחי
            const todayEntry = achievement.trackingTable.find(e =>
                new Date(e.day).getTime() === today.getTime()
            );

            // אם היום קיים ועדיין לא סומן-מעדכן
            if (todayEntry && typeof todayEntry.isMarkedToday === 'undefined') {
                todayEntry.isMarkedToday = false;
            }

            const allMarked = achievement.trackingTable.every(e => e.isMarkedToday);
            const targetDate = new Date(achievement.targetDate);
            const targetDateReached = today >= targetDate;

            if (targetDateReached && allMarked) {
                achievement.isCompleted = true;
                achievement.statusTable = 'completed';

                if (!achievement.notificationSent) {
                    try {
                        const user = await userModel.findById(achievementOfUser);

                        const newNotification = {
                            _id: new mongoose.Types.ObjectId(),
                            type: 'table',
                            notifiedUserId: achievementOfUser,
                            achievementId: achievement._id,
                            achievementTitle: achievement.title,
                            isRead: false,
                            creatingDate: new Date()
                        };

                        user.notifications.push(newNotification);
                        await user.save();
                        achievement.notificationSent = true;
                    } catch (err) {
                        console.error(err.message);
                    }
                }

            } else if (targetDateReached && !allMarked) {
                achievement.statusTable = 'failed';
            } else {
                achievement.statusTable = 'in-progress';
            }

            await achievement.save();
        }

        console.log("Cron ran: achievements updated");
    } catch (err) {
        console.error("Cron failed:", err.message);
    }
});


// פונקציה להצגת הישג של משתמש
export const getAchievementByUser = async (req, res) => {
    const userId = req.user._id;
    const achievementId = req.params.achievementId;

    console.log('achievementId: ', achievementId);
    console.log('userId: ', userId);

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(achievementId)) {
        return res.status(400).json({ type: "not_valid_id", message: "One or more IDs are not in the correct format" });
    }

    try {
        const achievement = await achievementModel.findOne({ _id: achievementId, userId });

        if (!achievement) {
            return res.status(404).json({ type: "not_found", message: "Achievement not found for this user" });
        }

        return res.json({ achievement });

    } catch (err) {
        console.error("Error fetching tracking table:", err);
        return res.status(500).json({ type: "server_error", message: "Failed to fetch tracking table" });
    }
};
