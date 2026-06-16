import express from 'express';
import http from 'http'

import {Server} from 'socket.io';


const app = express();
const server = http.createServer(app);

const allowedOrigins = [process.env.FRONTEND_URL, /^http:\/\/localhost:\d+$/];

const io = new Server(server, { cors: { origin: allowedOrigins } });

//getrecivershocet - returns array of active socket IDs
function getReceiverSocketId(userId){
  return userSocketMap[userId] ? Array.from(userSocketMap[userId]) : [];
}

//online users = {userid : Set[socketID]}
const userSocketMap = {};

// we know socket.on() to listem but this is the only exception
io.on("connection", (socket)=>{
  const userId = socket.handshake.query.userId

  if(userId) {
    if(!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  // io.emit() sends event to everyone - broadcast
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", ()=>{
    if(userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if(userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  })
})

export {app, server, io, getReceiverSocketId};
