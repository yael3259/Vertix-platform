import express from "express";
import { getAllPosts, addPost, toggleLikePost, addComment, getCommentOfPostById, getPostsByUserId, getPostById, addToFavoritePosts, getFavoritePosts } from "../controllers/post.js";
import multer from "multer";
import { auth } from "../auth.js";



const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();


router.get("/", getAllPosts);
router.get("/:userId", getPostsByUserId);
router.get("/singlePost/:postId", getPostById);
router.post("/", auth, upload.single("mediaFile"), addPost);
router.post("/like/:userId", toggleLikePost);
router.post("/comment/:postId", addComment);
router.get("/comments/:postId", getCommentOfPostById);
router.post("/favorites/:userId", addToFavoritePosts);
router.get("/getFavorites/:userId", getFavoritePosts);

// אין צורך להוסיף הרשאה אבל צריך להציג הודעה שרק משתמש מחובר יכול להגיב/לתת לייק/להוסיף פוסט למועדפים


export default router;