import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../lib/db.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import ImageKit from "@imagekit/nodejs";
import { createClerkClient } from "@clerk/express";

/**
 * Purge MongoDB Database collections (User & Message models).
 */
export async function purgeMongoDB() {
  console.log("📁 Connecting to MongoDB...");
  await connectDatabase();
  console.log("📁 Purging database collections...");

  const userResult = await User.deleteMany({});
  const messageResult = await Message.deleteMany({});

  console.log(`✅ MongoDB Purged:`);
  console.log(`   - Deleted ${userResult.deletedCount} User profiles`);
  console.log(`   - Deleted ${messageResult.deletedCount} Messages`);
}

/**
 * Purge files inside ImageKit folder.
 */
export async function purgeImageKit() {
  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    console.log("⚠️ IMAGEKIT_PRIVATE_KEY is not defined. Skipping ImageKit cleanup.");
    return;
  }

  console.log("📷 Purging uploaded files from ImageKit...");
  const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  });

  try {
    const files = await imagekit.assets.list({ limit: 100 });
    console.log(`   Found ${files.length} files in ImageKit.`);

    for (const file of files) {
      console.log(`   - Deleting file: ${file.name} (ID: ${file.fileId})`);
      await imagekit.files.delete(file.fileId);
    }
    console.log("✅ ImageKit storage purged successfully.");
  } catch (error) {
    console.error("❌ Failed to delete files from ImageKit:", error.message);
  }
}

/**
 * Purge all users in Clerk.
 */
export async function purgeClerk() {
  if (!process.env.CLERK_SECRET_KEY) {
    console.log("⚠️ CLERK_SECRET_KEY is not defined. Skipping Clerk cleanup.");
    return;
  }

  console.log("🔐 Connecting to Clerk API to delete users...");
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  try {
    let deletedCount = 0;
    while (true) {
      const users = await clerk.users.getUserList({ limit: 50 });
      if (users.data.length === 0) {
        break;
      }

      for (const user of users.data) {
        const email = user.emailAddresses?.[0]?.emailAddress || "no-email";
        console.log(`   - Deleting Clerk user: ${user.id} (${email})`);
        await clerk.users.deleteUser(user.id);
        deletedCount++;
      }
    }
    console.log(`✅ Clerk purged successfully. Deleted ${deletedCount} users.`);
  } catch (error) {
    console.error("❌ Failed to purge Clerk users:", error.message);
  }
}

async function run() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npm run db:clean -- [options]
   Or: node src/scripts/clean-all.js [options]

Options:
  --db        Purge MongoDB collections (users and messages)
  --imagekit  Purge ImageKit files
  --clerk     Purge Clerk users
  --all       Purge all of the above (default if no flags are provided)
  -h, --help  Display this help message


  sample :
  npm run db:clean -- --db
  npm run db:clean -- --imagekit
  npm run db:clean -- --clerk
  npm run db:clean -- --all
  
`);
    return;
  }

  const cleanAll = args.length === 0 || args.includes("--all");
  const doDb = cleanAll || args.includes("--db");
  const doImageKit = cleanAll || args.includes("--imagekit");
  const doClerk = cleanAll || args.includes("--clerk");

  console.log("🏁 Starting cleanup execution...");

  if (doDb) {
    await purgeMongoDB();
  }

  if (doImageKit) {
    await purgeImageKit();
  }

  if (doClerk) {
    await purgeClerk();
  }

  console.log("🎉 Reset script execution completed successfully!");
}

// Execute CLI runner if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("clean-all.js")) {
  run()
    .catch((err) => {
      console.error("❌ Reset script encountered an error:", err);
      process.exitCode = 1;
    })
    .finally(async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log("🔌 Disconnected from MongoDB.");
      }
    });
}
