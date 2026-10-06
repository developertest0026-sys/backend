import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/swariya_jewel_db";
    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed Default Super Admin Account in Admin Collection if not exists
    try {
      const adminExists = await Admin.findOne({ email: "admin@swariya.com" });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("admin123", salt);
        await Admin.create({
          name: "Swariya Senior Admin",
          email: "admin@swariya.com",
          password: passwordHash,
          role: "SUPER_ADMIN"
        });
        console.log("👑 Default Admin account seeded in Admin collection: admin@swariya.com / admin123");
      }
    } catch (seedErr) {
      console.warn("⚠️ Admin seeding check error:", seedErr.message);
    }

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
