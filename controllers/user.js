import { userModel, generateToken } from "../models/user.js";
import bcrypt from "bcryptjs";
import mongoose from 'mongoose';




// הצגת כל המשתמשים
export const getAllUsers = async (req, res) => {
    try {
        let allUsers = await userModel.find({}, 'userName nickname email role enterDate gender profilePicture tags');
        return res.json(allUsers);
    }
    catch (err) {
        return res.status(500).json({ type: "server error", message: "Could not retrieve users" });
    }
}


// הצגת משתמש בודד
export const getOneUser = async (req, res) => {
    let { userId } = req.params;

    try {
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ type: "not valid id", message: "ID is not the right format" });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ type: "undefined user for display", message: "This user is undefined for display" });
        }

        return res.json(user);
    }

    catch (err) {
        console.error(err);
        return res.status(400).json({ type: "invalid operations", message: "Could not get user" });
    }
}


// רישום משתמש
export const addUser = async (req, res) => {
    let { userName, nickname, email, password, gender, profilePicture } = req.body;

    if (!userName || !email || !password || !gender) {
        return res.status(400).json({ type: "missing parameters", message: "enter userName, email, password and gender" });
    }

    try {
        const sameUser = await userModel.findOne({ email: email });

        if (sameUser) {
            return res.status(409).json({ type: "same user", message: "user with such email already exist" });
        }

        const ChangingUserStatus = (userName) => {
            if (userName.startsWith(process.env.ROLE_CODE)) {
                const newUserName = userName.replace(process.env.ROLE_CODE, '').trim();
                return { userName: newUserName, role: "ADMIN" };
            }
            return { userName, role: "USER" };
        };

        const { userName: updatedUserName, role } = ChangingUserStatus(userName);

        let hashedPassword = await bcrypt.hash(password, 15);

        let newUser = new userModel({
            userName: updatedUserName,
            nickname,
            email,
            password: hashedPassword,
            role,
            gender,
            profilePicture,
            tags: [],
            skills: [],
            enterDate: new Date()
        });

        await newUser.save();

        let token = generateToken(newUser._id, newUser.userName, newUser.gender);
        console.log("token: ", token);

        return res.json({
            userId: newUser._id,
            userName: newUser.userName,
            nickname: newUser.nickname,
            role: newUser.role,
            token,
            email: newUser.email,
            gender: newUser.gender,
            profilePicture: newUser.profilePicture,
            enterDate: newUser.enterDate,
            tags: newUser.tags,
            skills: newUser.skills
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({ type: "invalid operations", message: "Could not add user" });
    }
};


// התחברות משתמש
export const login = async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        console.log("Missing parameters");
        return res.status(400).json({ type: "missing parameters", message: "enter email and password" });
    }

    try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ type: "user is undefined", message: "one or more details are invalide" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", passwordMatch);

        if (!passwordMatch) {
            return res.status(404).json({ type: "user is undefined", message: "password is invalide" });
        }

        let token = generateToken(user._id, user.userName, user.gender, user.role);
        console.log("Token generated");

        return res.json({
            _id: user._id,
            userName: user.userName,
            nickname: user.nickname,
            role: user.role,
            enterDate: user.enterDate,
            token,
            email: user.email,
            gender: user.gender,
            tags: user.tags,
            skills: user.skills,
            profilePicture: user.profilePicture

        });
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ type: "invalid operations", message: "Could not log in user" });
    }
}


// מחיקת משתמש
export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    console.log("deleteUser function called with ID:", userId);

    try {
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ type: "not valid id", message: "ID is not in the right format" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ type: "undefined user", message: "This user is undefined" });
        }

        await userModel.findByIdAndDelete(userId);
        return res.json({ message: "User deleted successfully", user });

    } catch (err) {
        console.error("Error details:", { message: err.message, stack: err.stack, code: err.code });
        return res.status(500).json({ type: "invalid operation", message: err.message });
    }
};


// התנתקות משתמש
export const log_outUser = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ type: "not valid id", message: "ID is not the right format" });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ type: "undefined user for log out", message: "This user is undefined for log out" });
        }

        user.status = "guest";
        await user.save();

        return res.json({ message: "User logged out successfully", user });

    } catch (err) {
        console.error("Error details:", { message: err.message, stack: err.stack, code: err.code });
        return res.status(500).json({ type: "invalid operation", message: err.message });
    }
}


// שינוי סיסמת משתמש
export const resetPasswordUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email: email })
        if (!user)
            return res.status(404).json({ type: "user is undefined", message: "one or more ditails are invalide" })
        console.log("user found!");

        user.password = await bcrypt.hash(password, 15);

        await user.save();
        res.json({ message: "Password reset successfully" })

    } catch (err) {
        console.error("Error details:", { message: err.message, stack: err.stack, code: err.code, });
        return res.status(500).json({ type: "invalid operation", message: err.message });
    }
}


// עדכון פרטי משתמש
// export const updateUserDetails = async (req, res) => {
//     const { userId } = req.params;
//     let { userName, nickname, email, gender, profilePicture, tags, skills } = req.body;

//     if (!mongoose.isValidObjectId(userId))
//         return res.status(400).json({ type: "not valid id", massage: "id is in not the right format" });

//     try {
//         let user = await userModel.findById(userId);
//         if (!user)
//             return res.status(400).json({ type: "user is undefined", massage: "there is no user with such id" });

//         user.userName = userName || user.userName;
//         user.nickname = nickname || user.nickname;
//         user.email = email || user.email;
//         user.gender = gender || user.gender;
//         user.tags = tags || user.tags;
//         if (skills) {
//             user.skills = skills;
//         } user.profilePicture = profilePicture || user.profilePicture;

//         await user.save();

//         return res.json(user);

//     } catch (err) {
//         console.log(err);
//         res.status(400).json({ type: "invalid operation", massage: "Could not update user details" });
//     }
// }
export const updateUserDetails = async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ type: "not valid id", message: "id is not in the right format" });
    }

    try {
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ type: "user not found", message: "no user with such id" });
        }

        Object.keys(updates).forEach(key => {
            if (key === 'skills' && Array.isArray(updates[key])) {
                user.skills = [...(user.skills || []), ...updates[key]];
            } else if (key in user) {
                user[key] = updates[key];
            }
        });

        await user.save();
        return res.json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ type: "server error", message: "failed to update user details" });
    }
}


// המלצת מעקב אחרי משתמשים רנדומליים
export const getRandomUsers = async (req, res) => {
    try {
        const randomUsers = await userModel.aggregate([
            { $sample: { size: 3 } },
            { $project: { password: 0 } }
        ]);

        return res.json(randomUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ type: "invalid operation", massage: "Could not get random users" });
    }
};
