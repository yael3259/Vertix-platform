import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectToDb } from "./DB/connectToDb.js";
import userRouter from "./routes/user.js";
import achievementRouter from "./routes/achievement.js";
import './controllers/achievement.js';
import postRouter from "./routes/post.js";


dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"]
}));

app.options("*", cors());

const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.get("/", (req, res) => {
    res.send("server is running");
});

app.use("/domain/api/user", userRouter);
app.use("/domain/api/achievement", achievementRouter);
app.use("/domain/api/post", postRouter);

connectToDb();

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
