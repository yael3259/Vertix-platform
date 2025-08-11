import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDb } from "./DB/connectToDb.js";
import userRouter from "./routes/user.js";
import achievementRouter from "./routes/achievement.js";
import './controllers/achievement.js';
import postRouter from "./routes/post.js";


dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
    origin: "https://vertix-zeta.vercel.app",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: true,
    optionsSuccessStatus: 200
}));

app.get("/", (req, res) => {
    res.send("Welcome to the server! The API is running.");
});

app.use("/domain/api/user", userRouter);
app.use("/domain/api/achievement", achievementRouter);
app.use("/domain/api/post", postRouter);

connectToDb();

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> console.log(`server running on port ${PORT}`));
