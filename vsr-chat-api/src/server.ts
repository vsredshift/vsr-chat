import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { StreamChat } from "stream-chat";
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
