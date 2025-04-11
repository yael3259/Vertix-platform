import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { config } from "dotenv";
import { connectToDb } from "./DB/connectToDb.js";
import userRouter from "./routes/user.js";
import achievementRouter from "./routes/achievement.js";
import postRouter from "./routes/post.js";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    methods: "POST, GET, PUT, DELETE",
    origin: "*"
}));


app.use("/domain/api/user", userRouter);
app.use("/domain/api/achievement", achievementRouter);
app.use("/domain/api/post", postRouter);

config();
connectToDb();

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> {`server running on port ${PORT}`})