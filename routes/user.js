import express from "express";
import { getAllUsers, getOneUser, addUser, login, deleteUser, log_outUser, getUsersByValue, resetPasswordUser, updateUserDetails, getRandomUsers, addFriendToNetwork, getFollowing, getNotificationsByUser, markNotificationsAsRead } from "../controllers/user.js";
import { auth } from "../auth.js";


const router = express.Router();

router.get("/getUsersWithSameLetters", getUsersByValue);
router.get("/", getAllUsers);
router.get("/random", getRandomUsers);
router.get("/:userId", getOneUser);
router.get("/following/:userId", getFollowing);
router.get("/notification/:userId", getNotificationsByUser);
router.post("/", addUser);
router.post("/login", login);
router.post("/network/:userId", addFriendToNetwork);
// router.delete("/:userId", deleteUser);
router.put("/log_out/:userId", log_outUser);
router.put("/", resetPasswordUser);
router.put("/update/:userId", updateUserDetails);
router.put("/markNotifications/:userId", markNotificationsAsRead);


export default router;