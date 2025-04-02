import express from "express";
import { getAllPosts, addPost, toggleLikePost } from "../controllers/post.js";



const router = express.Router();


router.get("/", getAllPosts);
router.post("/", addPost);
router.put("/:postId", toggleLikePost);


export default router;