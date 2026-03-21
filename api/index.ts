import express from "express";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());

// API Route for Chat Base
app.get("/api/chat-base", (req, res) => {
  const chatFilePath = path.join(process.cwd(), "chat-base.json");
  if (fs.existsSync(chatFilePath)) {
    const chatData = fs.readFileSync(chatFilePath, "utf-8");
    res.json(JSON.parse(chatData));
  } else {
    res.status(404).json({ error: "Chat base not found" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
