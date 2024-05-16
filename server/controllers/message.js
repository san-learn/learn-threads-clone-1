import { v2 as cloudinary } from "cloudinary";

import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

import { getRecepientSocketId, io } from "../socket/socket.js";

export async function sendMessage(request, response) {
  const _id = request.user._id;
  const { recipientId, text } = request.body;
  let { image } = request.body;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [_id, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [_id, recipientId],
        lastMessage: {
          text: text,
          sender: _id,
        },
      });

      await conversation.save();
    }

    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image);

      image = uploadedImage.secure_url;
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: _id,
      text: text,
      image: image || "",
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({ lastMessage: { text: text, sender: _id } }),
    ]);

    const recepientSocketId = getRecepientSocketId(recipientId);

    if (recepientSocketId) {
      io.to(recepientSocketId).emit("newMessage", newMessage);
    }

    response
      .status(200)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to send message: ${error.message}`);
  }
}

export async function getAllMessage(request, response) {
  const { id } = request.params;
  const _id = request.user._id;

  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [_id, id] },
    });

    if (!conversation) {
      response.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    response
      .status(200)
      .json({ message: "Messages found successfully", data: messages });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to get messages: ${error.message}`);
  }
}

export async function getAllConversation(request, response) {
  const _id = request.user._id;

  try {
    const conversations = await Conversation.find({ participants: _id })
      .populate({ path: "participants", select: "username profilePicture" })
      .sort({ createdAt: -1 });

    if (!conversations) {
      response.status(404).json({ error: "Conversations not found" });
    }

    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== _id.toString()
      );
    });

    response.status(200).json({
      message: "Conversations found successfully",
      data: conversations,
    });
  } catch (error) {
    response.status(500).json({ error: error.message });

    console.log(`Failed to get conversation: ${error.message}`);
  }
}
