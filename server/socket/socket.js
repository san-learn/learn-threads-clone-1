import { Server } from "socket.io";
import http from "http";
import express from "express";

import Message from "../models/message.js";

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

export function getRecepientSocketId(_id) {
  return userSocketMap[_id];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  const { _id } = socket.handshake.query;

  if (_id !== "undefined") {
    userSocketMap[_id] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("markMessageAsSeen", async ({ conversationId, recipientId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, seen: false },
        { $set: { seen: true } }
      );

      io.to(userSocketMap[recipientId]).emit("messageSeen", conversationId);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    delete userSocketMap[_id];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
