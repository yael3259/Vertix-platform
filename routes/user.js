import express from "express";
import { getAllUsers, addUser, login, deleteUser, log_outUser, resetPasswordUser, updateUserDetails, getRandomUsers } from "../controllers/user.js";



const router = express.Router();


router.get("/", getAllUsers);
router.get("/random", getRandomUsers);
router.post("/", addUser);
router.post("/login", login);
router.delete("/:userId", deleteUser);
router.put("/:userId", log_outUser);
router.put("/", resetPasswordUser);
router.put("/:userId", updateUserDetails);


export default router;