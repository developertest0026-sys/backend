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
      bufferCommands: true,
    });
    isConnected = true;

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed Default Super Admin Accounts in Admin Collection
    try {
      const adminEmails = ["admin@sawyria.com", "admin@swariya.com"];
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("admin123", salt);

      for (const email of adminEmails) {
        const adminExists = await Admin.findOne({ email });
        if (!adminExists) {
          await Admin.create({
            name: "Sawyria Senior Admin",
            email: email,
            password: passwordHash,
            role: "SUPER_ADMIN",
            isActive: true
          });
          console.log(`👑 Default Admin account seeded: ${email} / admin123`);
        }
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
