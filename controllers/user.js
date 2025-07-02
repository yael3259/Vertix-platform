import { userModel, generateToken } from "../models/user.js";
import bcrypt from "bcryptjs";
import mongoose from 'mongoose';




// הצגת כל המשתמשים
export const getAllUsers = async (req, res) => {
    try {
        let allUsers = await userModel.find({},
            'userName nickname email role enterDate gender profilePicture tags skills following notifications');
        return res.json(allUsers);
    }
    catch (err) {
        return res.status(500).json({ type: "server error", message: "Could not retrieve users" });
    }
}


// הצגת משתמשים לפי תחילת השם שהוקלד בתיבת החיפוש
export const getUsersByValue = async (req, res) => {
    console.log('Request query:', req.query);
    const value = req.query.value || "";
    if (!value) return res.json([]);

    try {
        // ודא שפה אין המרה או בדיקה על value שדורשת מזהה
        const regex = new RegExp(`^${value}`, "i");
        const filteredUsers = await userModel.find({ userName: { $regex: regex } });
        return res.json(filteredUsers);
    } catch (err) {
        console.error('Error in getUsersByValue:', err);
        return res.status(500).json({ message: 'Server error' });
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
            enterDate: new Date(),
            notifications: []
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
            skills: newUser.skills,
            notifications: newUser.notifications
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
            profilePicture: user.profilePicture,
            notifications: user.notifications,
            count: user.notifications.length
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
export const editUserDetails = async (req, res) => {
    const { userId } = req.params;
    let { userName, nickname, email, gender, profilePicture } = req.body;

    if (!mongoose.isValidObjectId(userId))
        return res.status(400).json({ type: "not valid id", massage: "id is in not the right format" });

    try {
        let user = await userModel.findById(userId);
        if (!user)
            return res.status(404).json({ type: "user is undifind", massage: "there is no user with such id" });

        user.userName = userName?.trim() || user.userName;
        user.nickname = nickname?.trim() || user.nickname;
        user.email = email?.trim() || user.email;
        user.gender = gender?.value?.trim() || user.gender;
        user.profilePicture = profilePicture?.trim() || user.profilePicture;

        await user.save();

        // מוחק את שדה הסיסמה מהאוביקט המוחזר (DB-לא מה)
        const userObj = user.toObject();
        delete userObj.password;

        return res.json(userObj);

    } catch (err) {
        console.log(err);
        res.status(400).json({ type: "invalid operation", massage: "could not edit user" });
    }
};

// הוספת כישור חדש
export const updateUserSkills = async (req, res) => {
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
            { $sample: { size: 6 } },
            { $project: { password: 0 } }
        ]);

        return res.json(randomUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ type: "invalid operation", massage: "Could not get random users" });
    }
};


// הוספת חברים חדשים
export const addFriendToNetwork = async (req, res) => {
    const { userId } = req.params;
    const { friendId } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(friendId)) {
        return res.status(400).json({ type: "not valid id", message: "id is not in the right format" });
    }

    try {
        const currentUser = await userModel.findById(userId);
        const newUserToAdd = await userModel.findById(friendId);

        if (!currentUser || !newUserToAdd) {
            return res.status(404).json({ type: "user not found", message: "logged in user not found" });
        }

        if (currentUser._id.equals(newUserToAdd._id)) {
            return res.status(400).json({ message: "user can't add himself" });
        }

        if (currentUser.following.includes(newUserToAdd._id)) {
            return res.status(400).json({ message: "user already follows this user" });
        }

        currentUser.following.push(newUserToAdd._id);
        await currentUser.save();

        try {
            const newNotification = {
                _id: new mongoose.Types.ObjectId(),
                type: 'follow',
                notifiedUserId: newUserToAdd,
                fromUserId: currentUser,
                isRead: false,
                creatingDate: new Date()
            }

            newUserToAdd.notifications.push(newNotification);
            await newUserToAdd.save();

        } catch (err) {
            console.error(err.message);
        }

        return res.json({ message: "Friend added successfully", user: currentUser });

    } catch (err) {
        console.error("Error adding friend:", err);
        return res.status(500).json({ message: "Server error" });
    }
}


// הצגת following של משתמש
export const getFollowing = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await userModel.findById(userId)
            .populate('following', '_id userName profilePicture nickname')
            .select('following');

        if (!user) {
            return res.status(400).json({ type: "user not found", message: "user id is not found" });
        }

        const followingList = user.following.map(f => ({
            _id: f._id,
            userName: f.userName,
            profilePicture: f.profilePicture,
            nickname: f.nickname
        }));

        return res.status(200).json({ count: followingList.length, following: followingList });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};


// הצגת התראות של משתמש
export const getNotificationsByUser = async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ type: "not valid id", message: "id is not in the right format" });
    }

    try {
        const user = await userModel.findById(userId)
            .select('notifications')
            .populate('notifications.fromUserId', 'userName profilePicture _id')
            .populate('notifications.postId', 'content _id')
            .populate('notifications.achievementId', 'title isCompleted _id')
        // .populate('notifications.commentId', '_id');

        if (!user)
            return res.status(404).json({ message: "User not found" });

        return res.status(200).json({
            notifications: user.notifications,
            count: user.notifications.length
        });

    }
    catch (err) {
        return res.status(500).json({ type: "server error", message: "Could not retrieve notifications", error: err.message });
    }
}


// עדכון התראות כנקראו
export const markNotificationsAsRead = async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ type: "not valid id", message: "id is not in the right format" });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ type: "not found", message: "User not found" })
        }

        user.notifications.forEach(notification => {
            notification.isRead = true;
        });

        await user.save();

        return res.status(200).json({ type: "success", message: "All notifications marked as read" })
    }
    catch (err) {
        return res.status(500).json({ type: "server error", message: "Could not update notifications", error: err.message });
    }
}
