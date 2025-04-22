import express from "express";
import { getAllPosts, addPost, toggleLikePost, addComment, getCommentOfPostById } from "../controllers/post.js";
import multer from "multer";



const storage = multer.memoryStorage();
const upload = multer({ storage });


const router = express.Router();


router.get("/", getAllPosts);
// router.post("/", addPost);
router.post("/", upload.single("mediaFile"), addPost);

// router.put("/:postId", toggleLikePost);
router.post("/:postId", toggleLikePost);
router.post("/comment/:postId", addComment);
router.get("/comments/:postId", getCommentOfPostById);



export default router;