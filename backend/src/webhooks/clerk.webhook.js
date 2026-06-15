import express from "express";
import { verifyWebhook } from "@clerk/express/webhooks";

import User from "../models/user.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🔥 Clerk webhook received");

  const signingSecret =
    process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? process.env.CLERK_WEBHOOK_SIGNIN_KEY;

  if (!signingSecret) {
    res.status(503).json({ message: "Webhook secret is not provided" });
    return;
  }

  try {
    const evt = await verifyWebhook(req, { signingSecret });

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const clerkUser = evt.data;

      const email =
        clerkUser.email_addresses?.find((entry) => entry.id === clerkUser.primary_email_address_id)
          ?.email_address ?? clerkUser.email_addresses?.[0]?.email_address;

      const fullName =
        [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(" ") ||
        clerkUser.username ||
        email?.split("@")[0] ||
        "";

      if (email && fullName) {
        await User.findOneAndUpdate(
          { clerkId: clerkUser.id },
          {
            clerkId: clerkUser.id,
            email,
            fullName,
            profilePic: clerkUser.image_url ?? "",
          },
          { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
        );
      }
    }

    if (evt.type === "user.deleted" && evt.data.id) {
      await User.findOneAndDelete({ clerkId: evt.data.id });
    }

    res.status(200).json({ received: true });

    console.log("🔥 Clerk webhook Sucessfull Sended to MONGO");
  } catch (error) {
    console.error("Error in Clerk webhook:", error);
    res.status(400).json({ message: "Webhook verification failed" });
  }

})


export default router;


