import express from "express";
import multer from "multer";
import { auth } from "../auth.js";
import {
    getAllPosts,
    addPost,
    deletePost,
    editPost,
    toggleLikePost,
    addComment,
    getCommentOfPostById,
    getPostsByUserId,
    getPostById,
    addToFavoritePosts,
    getFavoritePosts
} from "../controllers/post.js";



const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();


router.get("/", getAllPosts);
router.get("/:userId", getPostsByUserId);
router.get("/singlePost/:postId", getPostById);
router.post("/", auth, upload.single("mediaFile"), addPost);
router.delete("/:postId", deletePost);
router.put("/:postId", editPost);
router.post("/like/:userId", toggleLikePost);
router.post("/comment/:postId", addComment);
router.get("/comments/:postId", getCommentOfPostById);
router.post("/favorites/:userId", addToFavoritePosts);
router.get("/getFavorites/:userId", getFavoritePosts);



export default router;