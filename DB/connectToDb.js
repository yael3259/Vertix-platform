import mongoose from "mongoose";


// התחברות למסד נתונים לוקאלי
export const connectToDb = async () => {
    try {
        let connect = await mongoose.connect("mongodb://0.0.0.0:27017/vertixDB");
        console.log("mongo db connected!")
    } catch (err) {
        console.log(err);
        console.log("cannot connect to mongo db");
        process.exit(1);
    }
}