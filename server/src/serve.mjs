import express from "express";
import cors from "cors";
import { Conversation } from "./conversation.mjs";
import { listAllConversations } from "./utils.mjs";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// TODO: implement this server-side, poll Redis for previous conversations
// to display in a sidebar...
app.get("/api/list_all_conversations", async (req, res) => {
  return;
});

// TODO: Should get the contents of the current conversation.
app.get("/api/get_conversation", async (req, res) => {
  res.json("Server is running...");
});

// TODO: Should get the current conversation, then do conversation.chatCompletion(message)
app.post("/api/send_message", async (req, res) => {
  const userInput = req.body.message;
  const reply = "Server received message: " + userInput;
  res.json(reply);
});

// TODO: This ought to happen on connection to the server.
app.post("/api/start_conversation", async (req, res) => {
  const conversation = new Conversation();
  await conversation.start();
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// TODO: Somewhere we'll have to end the conversation.
// await conversation.end();
