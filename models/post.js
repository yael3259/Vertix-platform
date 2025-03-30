import mongoose from "mongoose";
import Joi from 'joi';





// סכמת תגובה
export const commentSchema = mongoose.Schema({
    // commentId: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId },
    text: { type: String, required: true },
    image: { type: String },
    date: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
});


// סכמת פוסט
export const postSchema = mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts' },
    category: { type: String, required: true },
    content: { type: String, required: true },
    backgroundColor: { type: String, default: '#FFFFFF' },
    likes: { type: Number, default: 0 },
    comments: [commentSchema],
    postingDate: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
});





export const postValidator = (post) => {
    const schema = Joi.object({
        content: Joi.string().min(5).max(70).required(),
        backgroundColor: Joi.string().optional(),
        likes: Joi.number().integer().min(0).optional(),
        comments: Joi.array().optional(),
    });
    return schema.validate(post);
};


export const postModel = mongoose.model('Posts', postSchema);