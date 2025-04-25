import mongoose from "mongoose";
import Joi from "joi";




const defaultDate = () => {
    const today = new Date();
    const threeDays = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return threeDays;
}


// סכמת טבלת מעקב
const trackingTableSchema = mongoose.Schema({
    day: { type: Date, required: true },
    isMarkedToday: { type: Boolean, default: false },
    currentDay: { type: Date, default: new Date()},
    isCompleted: { type: Boolean, default: false }
});


// סכמת הישג
export const achievementSchema = mongoose.Schema({
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievements' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetDate: { type: Date, required: true, default: defaultDate },
    category: { type: String, required: true },
    trackingTable: [trackingTableSchema],
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
});


export const achievementValidator = (achievement) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(25).required(),
        description: Joi.string().min(8).max(100).required(),
    });

    return schema.validate(achievement);
};


export const achievementModel = mongoose.model('Achievements', achievementSchema);