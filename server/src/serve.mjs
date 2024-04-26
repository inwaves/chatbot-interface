import express from "express";
import cors from "cors";
import { Conversation } from "./conversation.mjs";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/read_conversation", async (req, res) => {
  res.json("Hello world!");
});

app.post("/api/start_conversation", async (req, res) => {
  const conversation = new Conversation();

  await conversation.start();

  const userMessage = getUserMessageFromRequest(req);
  const response = await conversation.chatCompletion(userMessage);

  res.json(response);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// TODO: Somewhere we'll have to end the conversation.
// await conversation.end();
