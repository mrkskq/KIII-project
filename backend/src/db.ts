import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/busly";

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");
}
