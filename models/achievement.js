import mongoose from "mongoose";
import Joi from "joi";



export const sevenDaysForBoost = () => {
    const today = new Date();
    const week = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);
    return week;
}


// סכמת טבלת מעקב
const trackingTableSchema = mongoose.Schema({
    day: { type: Date, required: true },
    isMarkedToday: { type: Boolean, default: false },
    currentDay: { type: Date, default: new Date() },
}, { _id: true });


// סכמת הישג
export const achievementSchema = mongoose.Schema({
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievements' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetDate: { type: Date, required: true },
    category: { type: String, required: true },
    trackingTable: [trackingTableSchema],
    isCompleted: { type: Boolean, default: false },
    isPointsGiven: { type: Boolean, default: false },
    statusTable: { type: String, enum: ['completed', 'failed', 'in-progress'], default: 'in-progress' },
    notificationSent: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
});


// סכמת הישג מהיר (בוסט)
const boostSchema = mongoose.Schema({
    boostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Boosts' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetDate: { type: Date, default: sevenDaysForBoost },
    category: { type: String, required: true },
    trackingTable: [trackingTableSchema],
    isActive: { type: Boolean },
    startDate: { type: Date, default: new Date() },
    missedDay: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    isPointsGiven: { type: Boolean, default: false },
    statusTable: { type: String, enum: ['completed', 'failed', 'in-progress'], default: 'in-progress' },
    notificationSent: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
})


export const achievementValidator = (achievement) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(25).required(),
        description: Joi.string().min(8).max(100).required(),
    });

    return schema.validate(achievement);
};


export const achievementModel = mongoose.model('Achievements', achievementSchema);
export const boostModel = mongoose.model('Boosts', boostSchema);