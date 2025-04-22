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


// רישום משתמש
// export const addUser = async (req, res) => {
//     let { userName, nickname, email, password, gender, profilePicture } = req.body;

//     if (!userName || !email || !password || !gender)
//         return res.status(400).json({ type: "missing parameters", message: "enter userName, email, password and gender" })

//     try {
//         const sameUser = await userModel.findOne({ email: email })

//         if (sameUser)
//             return res.status(409).json({ type: "same user", message: "user with such email already exist" });

//         // שינוי תפקיד משתמש
//         const ChangingUserStatus = (userName) => {

//             if (userName.startsWith(process.env.ROLE_CODE)) {
//                 const newUserName = userName.replace(process.env.ROLE_CODE, '').trim();
//                 console.log("After removing ROLE_CODE:", newUserName);
//                 return { userName: newUserName, role: "ADMIN" };
//             }
//             return { userName, role: "USER" };
//         };
//         const { userName: updatedUserName, role } = ChangingUserStatus(userName);

//         // הצפנת הסיסמה
//         let hashedPassword = await bcrypt.hash(password, 15);

//         let newUser = new userModel({ userName: updatedUserName, nickname, email, password: hashedPassword, role, gender, profilePicture, enterDate: new Date() });
//         console.log(newUser.enterDate);

//         await newUser.save();

//         let token = generateToken(newUser._id, newUser.userName, newUser.gender);

//         return res.json({
//             userId: newUser._id, userName: newUser.userName, nickname: newUser.nickname, role: newUser.role,
//             token, email: newUser.email, gender: newUser.gender, profilePicture: newUser.profilePicture, enterDate: newUser.enterDate
//         });
//     }
//     catch (err) {
//         return res.status(400).json({ type: "invalid operations", message: "Could not add user" });
//     }
// }
export const addUser = async (req, res) => {
    let { userName, nickname, email, password, gender, profilePicture } = req.body;

    console.log("📥 בקשה התקבלה עם הנתונים:", { userName, nickname, email, password, gender, profilePicture });

    // בדיקת שדות חובה
    if (!userName || !email || !password || !gender) {
        console.log("❌ שדות חסרים:", { userName, email, password, gender });
        return res.status(400).json({
            type: "missing parameters",
            message: "enter userName, email, password and gender"
        });
    }

    try {
        // בדיקת משתמש קיים
        const sameUser = await userModel.findOne({ email: email });
        if (sameUser) {
            console.log("⚠️ משתמש כבר קיים עם האימייל הזה:", email);
            return res.status(409).json({
                type: "same user",
                message: "user with such email already exist"
            });
        }

        // שינוי תפקיד לפי קוד
        const ChangingUserStatus = (userName) => {
            if (userName.startsWith(process.env.ROLE_CODE)) {
                const newUserName = userName.replace(process.env.ROLE_CODE, '').trim();
                console.log("🔐 קוד תפקיד מזוהה - הגדרת ADMIN:", newUserName);
                return { userName: newUserName, role: "ADMIN" };
            }
            return { userName, role: "USER" };
        };

        const { userName: updatedUserName, role } = ChangingUserStatus(userName);
        console.log("👤 שם משתמש לאחר שינוי סטטוס:", updatedUserName, "| תפקיד:", role);

        // הצפנת סיסמה
        let hashedPassword = await bcrypt.hash(password, 15);
        console.log("🔑 סיסמה הוצפנה בהצלחה");

        // יצירת משתמש חדש
        let newUser = new userModel({
            userName: updatedUserName,
            nickname,
            email,
            password: hashedPassword,
            role,
            gender,
            profilePicture,
            enterDate: new Date()
        });

        console.log("🆕 משתמש חדש לפני שמירה למסד:", newUser);

        await newUser.save();
        console.log("✅ משתמש נשמר במסד נתונים");

        // יצירת טוקן
        let token = generateToken(newUser._id, newUser.userName, newUser.gender);
        console.log("🎫 טוקן נוצר בהצלחה");

        return res.json({
            userId: newUser._id,
            userName: newUser.userName,
            nickname: newUser.nickname,
            role: newUser.role,
            token,
            email: newUser.email,
            gender: newUser.gender,
            profilePicture: newUser.profilePicture,
            enterDate: newUser.enterDate
        });
    }
    catch (err) {
        console.error("💥 שגיאה בשרת בעת הוספת משתמש:", err);
        return res.status(400).json({
            type: "invalid operations",
            message: "Could not add user"
        });
    }
};


// התחברות משתמש
export const login = async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ type: "missing parameters", message: "enter email and password" })

    try {
        const user = await userModel.findOne({ email: email })
        if (!user)
            return res.status(404).json({ type: "user is undifind", message: "one or more details are invalide" })
        if (!await bcrypt.compare(password, user.password))
            return res.status(404).json({ type: "user is undifind", message: "passwors is invalide" })

        let token = generateToken(user._id, user.userName, user.gender);

        return res.json({ _id: user._id, userName: user.userName, role: user.role, token, email: user.email, gender: user.gender, profilePicture: user.profilePicture });
    }
    catch (err) {
        return res.status(400).json({ type: "invalide operations", message: "Coild not log in user" })
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
            return res.status(404).json({ type: "user is undifind", message: "one or more ditails are invalide" })
        console.log("user found!");

        user.password = await bcrypt.hash(password, 15);

        await user.save();
        console.log("password changed successfully to ", password);
        res.json({ message: "Password reset successfully" });

    } catch (err) {
        console.error("Error details:", { message: err.message, stack: err.stack, code: err.code, });
        return res.status(500).json({ type: "invalid operation", message: err.message });
    }
}


// עדכון פרטי משתמש
export const updateUserDetails = async (req, res) => {
    const { userId } = req.params;
    let { userName, nickname, email, password, gender, profilePicture } = req.body;

    if (!mongoose.isValidObjectId(userId))
        return res.status(400).json({ type: "not valid id", massage: "id is in not the right format" });

    try {
        let user = await userModel.findById(userId);
        if (!user)
            return res.status(400).json({ type: "user is undifind", massage: "there is no user with such id" });

        user.userName = userName || user.userName;
        user.nickname = nickname || user.nickname;
        user.email = email || user.email;
        user.gender = gender || user.gender;
        user.profilePicture = profilePicture || user.profilePicture;

        await user.save();

        return res.json(user);

    } catch (err) {
        console.log(err);
        res.status(400).json({ type: "invalid operation", massage: "Could not update user details" });
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
