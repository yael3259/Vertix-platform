import mongoose from 'mongoose';
import { postModel } from "../models/post.js";





// הצגת כל הפוסטים
export const getAllPosts = async (req, res, next) => {
    let page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage);

    try {
        let allPosts = await postModel.find()
            .skip((page - 1) * perPage)
            .limit(perPage);

        return res.json(allPosts);
    } catch (err) {
        return res.status(400).json({ type: "invalid operation", message: "Could not get posts" });
    }
}


// הוספת פוסט
export const addPost = async (req, res) => {
    let { category, content, imagePost, backgroundColor, likes, comments } = req.body;

    if (!category || !content)
        return res.status(400).json({ type: "missing parameters", message: "enter category and content" });

    try {
        let jimagePost = '';
        if (req.imagePost) {
            jimagePost = imagePost;
        }

        if (req.file) {
            const base64Image = req.file.buffer.toString('base64');
            const mimeType = req.file.mimetype;
            jimagePost = `data:${mimeType};base64,${base64Image}`;
        }

        let newPost = new postModel({
            userId: req.user?._id || null,
            category,
            content,
            imagePost: jimagePost,
            backgroundColor,
            likes,
            comments,
            postingDate: new Date()
        });

        await newPost.save();
        return res.json(newPost);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ type: "server error", message: "Failed to add post" });
    }
};


// הוספת/ הסרת לייק בפוסט
export const toggleLikePost = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(postId))
        return res.status(400).json({ message: "Invalid post ID" });

    try {
        const post = await postModel.findById(postId);
        if (!post)
            return res.status(404).json({ message: "Post not found" });

        const userIndex = post.usersLiked.indexOf(userId);
        if (userIndex === -1) {
            post.usersLiked.push(userId);
            post.likes += 1;
        } else {
            post.usersLiked.splice(userIndex, 1);
            post.likes -= 1;
        }

        await post.save();
        return res.json({ likes: post.likes });

    } catch (error) {
        return res.status(500).json({ type: "server error", message: "faild to toggle like" });
    }
};


// הוספת תגובה לפוסט
export const addComment = async (req, res) => {
    const { postId } = req.params;
    const { text, image } = req.body;

    try {
        const post = await postModel.findById(postId);
        if (!post)
            return res.status(404).json({ message: "Post not found" });

        const newComment = {
            text,
            image,
            commentDate: new Date(),
            userId: req.user?._id || null
        };

        post.comments.push(newComment);
        await post.save();

        console.log("התגובה נוספה בהצלחה");
        return res.json(newComment);
    }
    catch (err) {
        return res.status(500).json({ type: "server error", message: "failed to add comment", error: err.message });
    }
}


// הצגת תגובות של פוסט מסויים
export const getCommentOfPostById = async (req, res) => {
    const { postId } = req.params;

    try{
        const post = await postModel.findById(postId);
        if (!post)
            return res.status(404).json({ message: "Post not found" });

        return res.status(200).json({ comments: post.comments });
    }

    catch(err){
        return res.status(500).json({ type: "server error", message: "faild to get comments" });
    }
}