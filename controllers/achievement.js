import { userModel } from "../models/user.js";
import mongoose from 'mongoose';
import { achievementModel, boostModel, sevenDaysForBoost } from "../models/achievement.js";
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


// הצגת כל הבוסטים של משתמש
export const getUserBoosts = async (req, res) => {
    let userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ type: "not valid id", message: "ID is not the right format" });
    }

    try {
        let userBoosts = await boostModel.find({ userId });

        return res.json(userBoosts);

    } catch (err) {
        return res.status(400).json({ type: "invalid operation", message: "Could not get boosts" });
    }
};


// הוספת הישג רגיל
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


// הוספת הישג מהיר (בוסט)
export const addBoost = async (req, res) => {
    let { title, description, category, shouldCreatePost } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ type: "not valid id", message: "ID is not the right format" });
    }

    if (!title || !description || !category) {
        return res.status(400).json({ type: "missing parameters", message: "enter title, description, targetDate and category" });
    }

    try {
        const target = sevenDaysForBoost();
        const trackingTable = createTrackingTable(new Date(), new Date(target));

        let newBoost = new boostModel({
            title,
            description,
            targetDate: target,
            category,
            trackingTable,
            isActive: true,
            userId: userId
        });

        const savedBoost = await newBoost.save();
        return res.status(201).json({ savedBoost, shouldCreatePost: shouldCreatePost });

    } catch (err) {
        console.error("Error adding boost:", err);
        return res.status(500).json({ type: "server error", message: "Could not add boost", error: err.message });
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


// עדכון סימון יומי בטבלת הישג
export const updateTrackingTableAchievement = async (req, res) => {
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


// עדכון סימון יומי בטבלת בוסט
export const updateTrackingTableBoost = async (req, res) => {
    const { boostId } = req.params;
    const { isMarkedToday } = req.body;

    if (!mongoose.isValidObjectId(boostId))
        return res.status(400).json({ type: "invalid id", message: "ID format is invalid" });

    if (typeof isMarkedToday !== "boolean")
        return res.status(400).json({ type: "invalid data", message: "isMarkedToday must be a boolean" });

    try {
        let boost = await boostModel.findById(boostId);
        if (!boost)
            return res.status(404).json({ type: "boost not found", message: "No boost found with this ID" });

        if (!boost.isActive)
            return res.status(400).json({ type: "inactive boost", message: "Cannot update a non-active boost" });

        let today = new Date();
        today.setHours(0, 0, 0, 0);

        let todayEntry = boost.trackingTable.find(entry =>
            new Date(entry.day).getTime() === today.getTime()
        );

        if (!todayEntry)
            return res.status(404).json({ type: "not found", message: "Today not found in tracking table" });

        todayEntry.isMarkedToday = isMarkedToday;

        await boost.save();

        return res.json(boost);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ type: "server error", message: "Failed to update boost" });
    }
};


// Cron Job לריצה יומית בחצות (עבור הישג רגיל)
cron.schedule("0 0 * * *", async () => {
    // cron.schedule("*/5 * * * * *", async () => {
    console.log("Daily achievement Cron initialized");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const achievements = await achievementModel.find();

        for (let achievement of achievements) {
            const achievementOfUser = achievement.userId;

            const todayEntry = achievement.trackingTable.find(e =>
                new Date(e.day).getTime() === today.getTime()
            );

            if (todayEntry && typeof todayEntry.isMarkedToday === 'undefined') {
                todayEntry.isMarkedToday = false;
            }

            const allMarked = achievement.trackingTable.every(e => e.isMarkedToday);
            const targetDate = new Date(achievement.targetDate);
            const targetDateReached = today >= targetDate;

            let pointsToAdd = 0;

            if (targetDateReached && allMarked) {
                achievement.isCompleted = true;
                achievement.statusTable = 'completed';

                // (נקודות לכל יום 10) טבלה שהושלמה מקבלת מספר נקודות כפול על כל יום
                if (!achievement.isPointsGiven) {
                    pointsToAdd = achievement.trackingTable.length * 10;

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

                    // עדכון נקודות בסכמת משתמש
                    user.points = (user.points || 0) + pointsToAdd;

                    await user.save();

                    achievement.notificationSent = true;
                    achievement.isPointsGiven = true;
                }
            }
            else if (targetDateReached && !allMarked) {
                achievement.statusTable = 'failed';

                // הוספת 5 נקודות לכל יום שסומן
                if (!achievement.isPointsGiven) {
                    pointsToAdd = 5 * achievement.trackingTable.filter(e => e.isMarkedToday).length;

                    const user = await userModel.findById(achievementOfUser);
                    user.points = (user.points || 0) + pointsToAdd;
                    await user.save();

                    achievement.isPointsGiven = true;
                }
            }
            else {
                achievement.statusTable = 'in-progress';
            }
            await achievement.save();
        }

        console.log("Cron ran: achievements updated");
    } catch (err) {
        console.error("Cron failed:", err.message);
    }
});


// Cron Job לריצה יומית בחצות (עבור הישג בוסט)
cron.schedule("0 0 * * *", async () => {
    // cron.schedule("*/5 * * * * *", async () => {
    console.log("Daily boost Cron initialized");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const boosts = await boostModel.find();

        for (let boost of boosts) {
            if (boost.isActive) {

                const boostOfUser = boost.userId;

                const todayEntry = boost.trackingTable.find(e =>
                    new Date(e.day).getTime() === today.getTime()
                );

                if (todayEntry && typeof todayEntry.isMarkedToday === 'undefined') {
                    todayEntry.isMarkedToday = false;
                }

                if (todayEntry && todayEntry.isMarkedToday === false) {
                    boost.statusTable = 'failed';
                    boost.isCompleted = false;
                    boost.missedDay = true;
                    boost.isPointsGiven = true;
                    boost.isActive = false;

                    await boost.save();
                    continue;
                }

                const allMarked = boost.trackingTable.every(e => e.isMarkedToday);
                const targetDate = new Date(boost.targetDate);
                const targetDateReached = today >= targetDate;

                let pointsToAdd = 0;

                if (targetDateReached && allMarked) {
                    boost.isCompleted = true;
                    boost.statusTable = 'completed';

                    // (5*4=נקודות ליום 20) בוסט שהושלם מקבל כפול 4 נקודות על כל יום
                    if (!boost.isPointsGiven && !boost.notificationSent) {
                        pointsToAdd = boost.trackingTable.length * 20;

                        const user = await userModel.findById(boostOfUser);

                        const newNotification = {
                            _id: new mongoose.Types.ObjectId(),
                            type: 'boost',
                            notifiedUserId: boostOfUser,
                            boostId: boost._id,
                            boostTitle: boost.title,
                            isRead: false,
                            // creatingDate: new Date()
                            creatingDate: boost.targetDate
                        };

                        user.notifications.push(newNotification);

                        // עדכון נקודות בסכמת משתמש
                        user.points = (user.points || 0) + pointsToAdd;
                        await user.save();

                        boost.notificationSent = true;
                        boost.isPointsGiven = true;
                        boost.isActive = false;
                    }
                }
                // איפוס נקודות ועדכון סטטוס הבוסט כ'נכשל' במקרה שיום עבר ולא סומן
                else if (targetDateReached && !allMarked) {
                    boost.statusTable = 'failed';

                    if (!boost.isPointsGiven) {
                        pointsToAdd = 0;

                        const user = await userModel.findById(boostOfUser);
                        user.points = (user.points || 0) + pointsToAdd;
                        await user.save();

                        boost.isPointsGiven = true;
                        boost.isActive = false;

                        // await boost.save();
                    }
                } else {
                    boost.statusTable = 'in-progress';
                }
                await boost.save();
            }
        }
        console.log("Cron ran: boosts updated");
    } catch (err) {
        console.error("Cron failed:", err.message);
    }
});


// הצגת הישג של משתמש
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


// הצגת בוסט של משתמש
export const getBoostByUser = async (req, res) => {
    const userId = req.user._id;
    const boostId = req.params.boostId;

    console.log('boostId: ', boostId);
    console.log('userId: ', userId);

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(boostId)) {
        return res.status(400).json({ type: "not_valid_id", message: "One or more IDs are not in the correct format" });
    }

    try {
        const boost = await boostModel.findOne({ _id: boostId, userId });

        if (!boost) {
            return res.status(404).json({ type: "not_found", message: "Achievement not found for this user" });
        }

        return res.json({ boost });

    } catch (err) {
        console.error("Error fetching tracking table:", err);
        return res.status(500).json({ type: "server error", message: "Failed to fetch tracking table" });
    }
};