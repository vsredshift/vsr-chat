import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { StreamChat } from "stream-chat";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { v4 as uuid4 } from "uuid";
import { db } from "./config/database.js";
import { eq } from "drizzle-orm";
import { chats, users } from "./db/schema.js";
import { text } from "stream/consumers";

dotenv.config();

const app = express();

app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: false }));

// Initialise Stream Client
const chatClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

// Initialise Open AI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialise Gemini API
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type GenerativeChatMessage = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

// Register user with Stream Chat
app.post("/register", async (req: Request, res: Response): Promise<any> => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const userId = email.replace(/[^a-zA-Z0-9_-]/g, "_");

    // Check if user exists
    const userResponse = await chatClient.queryUsers({ id: { $eq: userId } });

    if (!userResponse.users.length) {
      // Add new user to stream
      await chatClient.upsertUser({
        id: userId,
        name: name,
        email: email,
        role: "user",
      });
    }

    // Check for existing user in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId));

    if (!existingUser.length) {
      console.log(
        `User ${userId} does not exist in the database. Adding them...`
      );
      await db.insert(users).values({ userId, name, email });
    }

    res.status(200).json({ userId, name, email });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Send message to Chat AI
app.post("/chat", async (req: Request, res: Response): Promise<any> => {
  const { message, userId } = req.body || {};

  if (!message || !userId) {
    return res.status(400).json({ error: "Message and user are required" });
  }

  try {
    const { users: streamUsers } = await chatClient.queryUsers({ id: userId });

    if (!streamUsers.length) {
      return res
        .status(404)
        .json({ error: "User not found. Please register first." });
    }

    // Check for user in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId));

    if (!existingUser.length) {
      return res
        .status(404)
        .json({ error: "User not found in database, please register" });
    }

    // Get chat history for context
    const chatHistory = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(chats.createdAt)
      .limit(6);

    // Format chat history
    const conversation: GenerativeChatMessage[] = chatHistory.flatMap(
      (chat) => [
        { role: "user", parts: [{ text: chat.message }] },
        { role: "model", parts: [{ text: chat.reply }] },
      ]
    );

    conversation.push({ role: "user", parts: [{ text: message }] });

    // Post message to Open AI GPT-4
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "user", content: message }],
    // });

    // Post message to Gemini API
    const response = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents: conversation,
    });

    const aiMessage: string = response.text ?? "No response from chat bot";

    // Save chat to database
    await db.insert(chats).values({ userId, message, reply: aiMessage });

    // Create or fetch channel
    const channel = chatClient.channel("messaging", `chat-${userId}`, {
      name: "AI Chat",
      created_by_id: "ai_bot",
    });

    await channel.create();
    await channel.sendMessage({ text: aiMessage, user_id: "ai_bot" });

    res.status(200).json({ reply: aiMessage });
  } catch (error) {
    console.log("Error generating ai response", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/get-messages", async (req: Request, res: Response): Promise<any> => {
  const { userId } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: "User ID is requierd" });
  }

  try {
    const chatHistory = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId));

    res.status(200).json({ messages: chatHistory });
  } catch (error) {
    console.log("Error fetching chat history", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
