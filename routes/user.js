import express from "express";
import { auth } from "../auth.js";
import {
    getAllUsers,
    getOneUser,
    addUser,
    login,
    deleteUser,
    getUsersByValue,
    resetPasswordUser,
    editUserDetails,
    updateUserPoints,
    getRandomUsers,
    addFriendToNetwork,
    removeFriendFromNetwork,
    getFollowing,
    getNotificationsByUser,
    markNotificationsAsRead,
    updateUserSkills
} from "../controllers/user.js";


const router = express.Router();


router.get("/getUsersWithSameLetters", getUsersByValue);
router.get("/", getAllUsers);
router.get("/random", getRandomUsers);
router.get("/:userId", getOneUser);
router.get("/following/:userId", getFollowing);
router.get("/notification/:userId", getNotificationsByUser);
router.post("/", addUser);
router.post("/login", login);
router.post("/network/:userId", auth, addFriendToNetwork);
router.delete("/removeNetwork/:userId", removeFriendFromNetwork);
// router.delete("/:userId", deleteUser); // הרשאת מנהל
router.put("/updatePoints/:userId", updateUserPoints);
router.put("/", resetPasswordUser);
router.put("/update/:userId", editUserDetails);
router.put("/markNotifications/:userId", markNotificationsAsRead);
router.put("/skills/:userId", updateUserSkills);

// למנהל יש אפשרות לראות את כל המשתמשים, למחוק משתמשים ולראות את כל ההישגים
export default router;