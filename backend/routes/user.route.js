import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  profile,
} from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import UsersChat from "../models/user.chat.model.js";
import ChatMessage from "../models/chat.message.model.js";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Regular routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authenticateUser, profile);

// Google Sign-In route
router.post("/google", async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Find or create the user in your database
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: name,
        email,
        password: "", // No password needed for Google sign-in
      });
      await user.save();
    }

    // Generate a JWT for your app
    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token: appToken });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(400).json({ message: "Invalid token" });
  }
});

// Fetch user chats
router.get("/api/chats", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching chats for user:", userId); // Debugging
    const chats = await UsersChat.find({ userId }).sort({ timestamp: -1 });
    console.log("Found chats:", chats); // Debugging
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new chat
router.post("/api/chats", authenticateUser, async (req, res) => {
  try {
    const { title, lastMessage } = req.body;
    const userId = req.user.id;

    const newChat = new UsersChat({
      userId,
      title,
      lastMessage,
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/api/chats/:id/messages", authenticateUser, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { content, sender } = req.body;

    // Verify the chat belongs to the user
    const chat = await UsersChat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const newMessage = new ChatMessage({
      chatId,
      sender,
      content,
    });

    await newMessage.save();
    console.log("New message saved:", newMessage); // Debugging

    // Update the last message in the chat
    chat.lastMessage = content.substring(0, 50) + (content.length > 50 ? "..." : "");
    chat.timestamp = Date.now();
    await chat.save();
    console.log("Chat updated:", chat); // Debugging

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a chat
router.delete("/api/chats/:id", authenticateUser, async (req, res) => {
  try {
    const chatId = req.params.id;
    await UsersChat.findByIdAndDelete(chatId); // Delete the chat by ID
    console.log("Chat deleted:", chatId); // Debugging

    // Also delete all associated messages
    await ChatMessage.deleteMany({ chatId });
    console.log("Messages deleted for chat:", chatId); // Debugging

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get messages for a specific chat
router.get("/api/chats/:id/messages", authenticateUser, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    
    // First verify this chat belongs to the user
    const chat = await UsersChat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    const messages = await ChatMessage.find({ chatId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a new message to a chat
router.post("/api/chats/:id/messages", authenticateUser, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { content, sender } = req.body;
    
    // Verify the chat belongs to the user
    const chat = await UsersChat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    const newMessage = new ChatMessage({
      chatId,
      sender,
      content
    });
    
    await newMessage.save();
    
    // Update the last message in the chat
    chat.lastMessage = content.substring(0, 50) + (content.length > 50 ? "..." : "");
    chat.timestamp = Date.now();
    await chat.save();
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;