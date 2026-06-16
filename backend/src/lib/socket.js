import express from 'express';
import http from 'http'

import {Server} from 'socket.io';


const app = express();
const server = http.createServer(app);

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];

const io = new Server(server, { cors: { origin: [ allowedOrigins ] } } );

//getrecivershocet
function getReceiverSocketId(userId){
  return userSocketMap[userId];
}

//online users = {userid : socketID}
const userSocketMap = {};

// we know socket.on() to listem but this is the only exception
io.on("connection", (socket)=>{
  const userId = socket.handshake.query.userId

  if(userId) userSocketMap[userId] = socket.id;

  // io.emit() sends event to everyone - broadcast
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("dissconnect", ()=>{
    if(userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  })
})

export {app, server, io, getReceiverSocketId};
