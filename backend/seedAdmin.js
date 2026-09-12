import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const adminName = process.env.ADMIN_NAME || "System Administrator";
    const adminEmail = (process.env.ADMIN_EMAIL || "admin123@gmail.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "adminpassword123";

    if (!process.env.DATABASE_URL) {
      console.error("Error: DATABASE_URL is missing in environment variables.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to MongoDB.");

    // Check if legacy admin account (admin@okdriver.com) exists and update it safely
    const oldAdmin = await User.findOne({ email: "admin@okdriver.com" });
    if (oldAdmin && oldAdmin.email !== adminEmail) {
      console.log(`Found legacy admin account "admin@okdriver.com". Updating email to "${adminEmail}"...`);
      oldAdmin.email = adminEmail;
      oldAdmin.role = "admin";
      await oldAdmin.save();
      console.log(`Successfully migrated legacy admin account email to "${adminEmail}".`);
    } else {
      const existingAdmin = await User.findOne({ email: adminEmail });

      if (existingAdmin) {
        console.log(`User with email "${adminEmail}" already exists.`);
        if (existingAdmin.role !== "admin") {
          existingAdmin.role = "admin";
          await existingAdmin.save();
          console.log(`Updated role for "${adminEmail}" to "admin".`);
        } else {
          console.log(`Admin account "${adminEmail}" is already configured.`);
        }
      } else {
        const adminUser = await User.create({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          role: "admin",
        });
        console.log(`Admin account successfully created!`);
        console.log(`  Name: ${adminUser.name}`);
        console.log(`  Email: ${adminUser.email}`);
        console.log(`  Role: ${adminUser.role}`);
      }
    }

    // Clean up any remaining orphan admin@okdriver.com account to avoid duplicates
    await User.deleteMany({ email: "admin@okdriver.com" });

    await mongoose.disconnect();
    console.log("Database connection closed. Seed completed.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin account:", error);
    process.exit(1);
  }
};

seedAdmin();
