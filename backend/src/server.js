import express from "express";
import "dotenv/config";

import { connectDatabase } from "./lib/db.js";

import cors from "cors";
import fs from "fs"
import path from "path"

import {clerkMiddleware} from '@clerk/express'
import clerkWebhook from './webhooks/clerk.webhook.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import userRoutes from './routes/user.route.js';
import User from "./models/user.model.js";
import {app, server, io, getReceiverSocketId} from "./lib/socket.js";

                          //* BEGINS
//? ENV Extraction
const PORT = process.env.PORT || 3001;
const allowedOrigins = [process.env.FRONTEND_URL, /^http:\/\/localhost:\d+$/];

const publicDir = path.join(process.cwd(),"public")

// use

//* its important that you don't parse the webhook event data
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook
);

app.use(express.json()) //* app.use for middleware

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(clerkMiddleware())

//get
app.get("/health", (req, res) => {
  res.status(200).json({
    ok:true,
  });
})

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);

// app.get("/", (req, res) => {
//   res.send("Backend is Running");
// })

// func
if(fs.existsSync(publicDir)){
  app.use(express.static(publicDir));

  app.get("*any", (req, res, next) =>{
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

      // server starts

async function startServer() {

  await connectDatabase();

  const serverData = await server.listen(PORT, "0.0.0.0", ()=>{
    console.log(`server is running on http://localhost:${PORT}`);
    console.log("Address : ", serverData.address());
  })

}

startServer();
