import express from "express";
import { getAllUsers, getOneUser, addUser, login, deleteUser, log_outUser, resetPasswordUser, updateUserDetails, getRandomUsers, addFriendToNetwork, getFollowing, getNotificationsByUser } from "../controllers/user.js";
import { auth } from "../auth.js";


const router = express.Router();


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


export default router;