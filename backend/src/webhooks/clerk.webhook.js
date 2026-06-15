import express from "express";
import { verifyWebhook } from "@clerk/express/webhooks";

import User from "../models/message.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🔥 [1] Clerk webhook received");

  const signingSecret = process.env.CLERK_WEBHOOK_SIGNIN_KEY;

  console.log("🔥 [2] Secret exists:", !!signingSecret);

  if (!signingSecret) {
    console.log("❌ [3] Missing webhook secret");
    return res.status(503).json({
      message: "Webhook secret is not provided",
    });
  }

  try {
    console.log("🔥 [4] Starting webhook verification");

    const evt = await verifyWebhook(req, { signingSecret });

    console.log("🔥 [5] Webhook verified");
    console.log("🔥 [6] Event type:", evt.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      console.log("🔥 [7] Processing user create/update");

      const clerkUser = evt.data;

      console.log("🔥 [8] Clerk user id:", clerkUser.id);

      const email =
        clerkUser.email_addresses?.find(
          (entry) => entry.id === clerkUser.primary_email_address_id
        )?.email_address ??
        clerkUser.email_addresses?.[0]?.email_address;

      const fullName =
        [clerkUser.first_name, clerkUser.last_name]
          .filter(Boolean)
          .join(" ") ||
        clerkUser.username ||
        email?.split("@")[0] ||
        "";

      console.log("🔥 [9] Extracted data:", {
        email,
        fullName,
      });

      if (email && fullName) {
        console.log("🔥 [10] About to save to MongoDB");

        const result = await User.findOneAndUpdate(
          { clerkId: clerkUser.id },
          {
            clerkId: clerkUser.id,
            email,
            fullName,
            profilePic: clerkUser.image_url ?? "",
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
            runValidators: true,
          }
        );

        console.log("🔥 [11] MongoDB operation completed");
        console.log("🔥 [12] Saved user:", result?._id);
      } else {
        console.log("⚠️ [10A] Missing email or fullName");
      }
    }

    if (evt.type === "user.deleted") {
      console.log("🔥 [13] Processing user delete");

      if (evt.data.id) {
        console.log("🔥 [14] Deleting user:", evt.data.id);

        await User.findOneAndDelete({
          clerkId: evt.data.id,
        });

        console.log("🔥 [15] User deleted");
      }
    }

    console.log("🔥 [16] Sending success response");

    res.status(200).json({
      received: true,
    });

    console.log("🔥 [17] Response sent");
    console.log("🔥 Clerk webhook Successfully Sent to Mongo");
  } catch (error) {
    console.error("❌ WEBHOOK ERROR START");
    console.error(error);
    console.error("❌ WEBHOOK ERROR END");

    res.status(400).json({
      message: "Webhook verification failed",
      error: error?.message,
    });
  }
});

export default router;
