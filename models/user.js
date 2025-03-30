import mongoose from "mongoose";
import Joi from 'joi';
import jwt from 'jsonwebtoken';
// import { mail_gender, female_gender, else_gender } from "./files/"



// סכמת תג
export const minimalTag = mongoose.Schema({
    tagName: String,
})

// סכמת משתמש
export const userSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    userName: String,
    nickname: String,
    email: { type: String, unique: true },
    password: {type: String, required: true},
    role: { type: String, default: "USER" },
    enterDate: { type: Date, default: Date.now() },
    gender: { type: String, enum: ['male', 'female', 'else'], required: true },
    profilePicture: { type: String, default: '' },
    tags: [minimalTag],
    // posts: [minimalPost],
    // achievements: [minimalAchievement]
})


// userSchema.pre('save', function (next) {
//     if (this.gender === 'male') {
//         this.profilePicture = mail_gender;
//     } else if (this.gender === 'female') {
//         this.profilePicture = female_gender;
//     } else if (this.gender === 'else') {
//         this.profilePicture = else_gender;
//     } else {
//         this.profilePicture = else_gender;
//     }
//     next();
// });


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
        { expiresIn: "1h" });
    return token;
}


export const userModel = mongoose.model('Users', userSchema);