import mongoose from 'mongoose';
import { postModel } from "../models/post.js";




// הוספת פוסט
export const addPost = async (req, res) => {
    let { userId, category, content, backgroundColor, likes, comments } = req.body;

    if (!category || !content)
        return res.status(400).json({ type: "missing parameters", message: "enter category and content" })

    try {
        let newPost = new postModel({
            userId: req.user?._id || null,
            category, content, backgroundColor, likes, comments, postingDate: new Date()
        })

        await newPost.save();

        return res.json(newPost);
    }
    catch(err){
        return res.status(500).json({ type: "server error", message: "Failed to add post" });
    }
}



// הוספת לייק לפוסט
