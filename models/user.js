import mongoose from "mongoose";
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { notificationSchema } from "./notification.js";



let defaultPic = "https://cdn-icons-png.freepik.com/256/10796/10796964.png?ga=GA1.1.1754982332.1740749915&semt=ais_hybrid";



// סכמת משתמש
export const userSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    userName: String,
    nickname: String,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "USER" },
    enterDate: { type: Date, default: Date.now() },
    gender: { type: String, required: true },
    profilePicture: { type: String, default: defaultPic },
    points: { type: Number, default: 0 },
    tags: [{ name: { type: String, enum: ['gold', 'silver', 'bronze'], required: true }, value: { type: Number, required: true, min: 0 } }],
    skills: { type: [String], default: [] },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    notifications: [notificationSchema],
    favoritePosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }]
})


export const userValidator = (_user) => {
    const userValidationSchema = Joi.object().keys({
        userName: Joi.string().min(2).max(12).required(),
        nickname: Joi.string().min(5).max(20).optional(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        gender: Joi.string().valid('male', 'female', 'else').required()
    })
    return userValidationSchema.validate(_user);
}


export const generateToken = (_id, userName, gender) => {
    let token = jwt.sign(
        { _id, userName, gender },
        process.env.SECRET_JWT,
        { expiresIn: "1d" });
    return token;
}


export const userModel = mongoose.model('Users', userSchema);