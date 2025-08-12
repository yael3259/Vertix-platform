import mongoose from "mongoose";


// התחברות למסד נתונים לוקאלי/מקוון
export const connectToDb = async () => {
    try {
        // await mongoose.connect(process.env.DB_URI || "mongodb://0.0.0.0:27017/vertixDB");
        await mongoose.connect(process.env.MONGO_URI || process.env.DB_URI);
        console.log("mongo db connected!");
    } catch (err) {
        console.log(err);
        console.log("cannot connect to mongo db");
        process.exit(1);
    }
}