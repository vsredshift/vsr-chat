import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { StreamChat } from "stream-chat";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { v4 as uuid4 } from "uuid";

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

// Register user with Stream Chat
app.post("/register", async (req: Request, res: Response): Promise<any> => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const userId = uuid4();

    const { users } = await chatClient.queryUsers({ id: { $eq: userId } });

    if (!users.length) {
      // Add new user to Stream
      await chatClient.upsertUser({
        id: userId,
        name,
        email,
        role: "user",
      });
    }

    res.status(201).json({ userId, name, email });
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
    const { users } = await chatClient.queryUsers({ id: userId });

    if (!users.length) {
      return res
        .status(404)
        .json({ error: "User not found. Please register first." });
    }

    // Post message to Open AI GPT-4
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "user", content: message }],
    // });

    // Post message to Gemini API
    const response = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
    });

    const aiMessage: string = response.text ?? "No response from chat bot";

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
