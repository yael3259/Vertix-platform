import mongoose from 'mongoose';
import { postModel } from "../models/post.js";
import { userModel } from '../models/user.js';



// הצגת כל הפוסטים
export const getAllPosts = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 15;

    try {
        let allPosts = await postModel.find()
            .sort({ postingDate: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate("userId", "userName profilePicture points")
            .populate("comments.userId", "userName profilePicture");

        return res.json(allPosts);
    } catch (err) {
        return res.status(400).json({
            type: "invalid operation",
            message: "Could not get posts"
        });
    }
}


// הצגת פוסטים לפי משתמש
export const getPostsByUserId = async (req, res) => {
    let { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ type: "not valid id", message: "ID is not the right format" });
    }

    try {
        let posts = await postModel.find({ userId });

        return res.json(posts);
    }
    catch (err) {
        return res.status(400).json({ type: "invalid operation", message: "Could not get posts" });
    }
}


// הצגת פוסט בודד
export const getPostById = async (req, res) => {
    let { postId } = req.params;
    console.log(postId);

    if (!mongoose.isValidObjectId(postId)) {
        return res.status(400).json({ type: "not valid id", message: "ID is not the right format" });
    }

    try {
        let post = await postModel.findById(postId)
            .populate("userId", "userName profilePicture")
            .populate("comments.userId", "userName profilePicture");

        return res.json(post);
    }

    catch (err) {
        return res.status(400).json({ type: "invalid operation", message: "Could not get post" });
    }
}


// הוספת פוסט
export const addPost = async (req, res) => {
    let { category, content, imagePost, backgroundColor, likes, comments } = req.body;
    const userId = req.user._id;

    console.log('userId: ', userId);
    console.log('post: ', req.body);

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ type: "not valid id", message: "ID is not the right format" });
    }

    if (!category || !content)
        return res.status(400).json({ type: "missing parameters", message: "enter category and content" });

    try {
        let jimagePost = '';
        if (imagePost) {
            jimagePost = imagePost;
        }

        if (req.file) {
            const base64Image = req.file.buffer.toString('base64');
            const mimeType = req.file.mimetype;
            jimagePost = `data:${mimeType};base64,${base64Image}`;
        }

        let newPost = new postModel({
            userId: userId,
            category,
            content,
            imagePost: jimagePost,
            backgroundColor,
            likes,
            comments,
            postingDate: req.body.postingDate ? new Date(req.body.postingDate) : new Date()
        });

        await newPost.save();
        return res.json(newPost);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ type: "server error", message: "הוספת פוסט נכשלה" });
    }
};


// הוספת/ הסרת לייק בפוסט
export const toggleLikePost = async (req, res) => {
    const { userId } = req.params;
    const { postId } = req.body;
    console.log("body received:", req.body);

    try {
        const post = await postModel.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        console.log("post.likes before:", post.likes);
        post.likes = post.likes || [];

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.json({ likes: post.likes, liked: !alreadyLiked });

    } catch (err) {
        console.error("toggleLike error:", err);
        res.status(500).json({ type: "server error", message: "שגיאה בהוספת לייק" });
    }
};


// הוספת תגובה לפוסט
export const addComment = async (req, res) => {
    const { postId } = req.params;
    const { text, userId } = req.body;

    try {
        const post = await postModel.findById(postId);
        if (!post)
            return res.status(404).json({ message: "Post not found" });

        const newComment = {
            _id: new mongoose.Types.ObjectId(),
            text,
            commentDate: new Date(),
            userId
        };

        post.comments.push(newComment);
        await post.save();

        await post.populate('comments.userId', 'userName profilePicture');

        const addedComment = post.comments[post.comments.length - 1];

        try {
            const user = await userModel.findById(post.userId);

            const newNotification = {
                _id: new mongoose.Types.ObjectId(),
                commentText: text,
                type: 'comment',
                notifiedUserId: post.userId,
                postId: post._id,
                commentId: addedComment._id,
                fromUserId: userId,
                isRead: false,
                creatingDate: new Date()
            };

            user.notifications.push(newNotification);
            await user.save();
        }

        catch (err) {
            console.error(notificationError.message);
        }

        return res.status(200).json(addedComment);

    } catch (err) {
        return res.status(500).json({ type: "server error", message: "שגיאה בהוספת תגובה" });
    }
};


// הצגת תגובות של פוסט בודד
export const getCommentOfPostById = async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await postModel.findById(postId).populate('comments.userId', 'userName profilePicture');

        if (!post)
            return res.status(404).json({ message: "Post not found" });

        return res.status(200).json({ comments: post.comments });
    }

    catch (err) {
        return res.status(500).json({ type: "server error", message: "faild to get comments" });
    }
}


// הוספת פוסט למועדפים
export const addToFavoritePosts = async (req, res) => {
    const { userId } = req.params;
    const { postId } = req.body;

    try {
        const user = await userModel.findById(userId);
        const post = await postModel.findById(postId);

        if (!user || !post) {
            return res.status(404).json({ type: "not found", message: "User or post not found" });
        }

        if (user.favoritePosts.includes(post._id)) {
            return res.status(400).json({ type: "duplicate", message: "הפוסט כבר סומן כמועדף" });
        }

        user.favoritePosts.push(post._id);

        await user.save();

        return res.status(200).json({ favoritePosts: user.favoritePosts });

    } catch (err) {
        return res.status(500).json({ type: "server error", message: "הוספת הפוסט למועדפים נכשלה" });
    }
}


// הצגת פוסטים מועדפים לפי משתמש
export const getFavoritePosts = async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }

    try {
        const user = await userModel.findById(userId).lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const favoritePosts = await postModel.find({
            _id: { $in: user.favoritePosts }
        }).populate("userId", "userName profilePicture")

        return res.status(200).json(favoritePosts);
    } catch (err) {
        console.error("Error getting favorite posts", err);
        return res.status(500).json({ message: "Server error fetching favorite posts" });
    }
}