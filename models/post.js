import mongoose from "mongoose";
import Joi from 'joi';





const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    image: { type: String },
    commentDate: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
}, { _id: true });


export const postSchema = new mongoose.Schema({
    category: { type: String, required: true },
    content: { type: String, required: true },
    imagePost: { type: String, default: '' },
    backgroundColor: { type: String, default: '#FFFFFF' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    comments: [commentSchema],
    postingDate: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
});


export const postValidator = (post) => {
    const schema = Joi.object({
        content: Joi.string().min(5).max(70).required(),
        backgroundColor: Joi.string().optional(),
        comments: Joi.array().optional(),
    });
    return schema.validate(post);
};


export const postModel = mongoose.model('Posts', postSchema);
