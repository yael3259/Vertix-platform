import mongoose from "mongoose";
import Joi from "joi";




// סכמת התראה
export const notificationSchema = new mongoose.Schema({
    type: { type: String, enum: ['comment', 'follow', 'table'], required: true },
    notifiedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts' },
    commentId: { type: mongoose.Schema.Types.ObjectId },
    commentText: { type: String },
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievements' },
    achievementTitle: { type: String },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    isRead: { type: Boolean, default: false },
    creatingDate: { type: Date, default: Date.now }
})



// export const notificationValidator = (notification) => {
//     const schema = Joi.object({
//         content: Joi.string().min(5).max(70).required(),
//         backgroundColor: Joi.string().optional(),
//         likes: Joi.number().integer().min(0).optional(),
//         comments: Joi.array().optional(),
//     });
//     return schema.validate(post);
// };


// export const notificationModel = mongoose.model('Notification', notificationSchema);