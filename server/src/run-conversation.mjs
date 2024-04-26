import readline from "node:readline";
import OpenAI from "openai";
import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import assert from "node:assert";

const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant.";
const DEFAULT_MODEL = "gpt-3.5-turbo";
const openai = new OpenAI();

class Conversation {
  constructor(model = DEFAULT_MODEL, systemPrompt = DEFAULT_SYSTEM_PROMPT) {
    this.systemPrompt = systemPrompt;
    this.model = model;
    this.conversationId = uuidv4();
    console.log("Started conversationId: %s", this.conversationId);
    this.redisClient;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async connectRedis() {
    try {
      this.redisClient = createClient();
      await this.redisClient.connect();
      console.log("Connected to Redis!");
    } catch (e) {
      console.error("Redis connection error:", e);
    }
  }

  async initConversation() {
    await this.redisClient.set(
      this.conversationId,
      JSON.stringify({
        messages: [{ role: "system", content: this.systemPrompt }],
        title: "",
      }),
    );
  }

  async getConversationHistory() {
    /** Retrieves the conversation history from the persistence layer.
     * @return: The conversation history as an array of messages.
     */

    const conversationString = await this.redisClient.get(this.conversationId);
    const conversationHistory = JSON.parse(conversationString);

    // Some sanity checks.
    assert("messages" in conversationHistory && "title" in conversationHistory);
    assert(
      Array.isArray(conversationHistory.messages) &&
        typeof conversationHistory.title === "string",
    );

    return conversationHistory.messages;
  }

  async setConversationHistory(newConversationHistory) {
    /** Sets the conversation history in the persistence layer.*/

    const conversationTitle = await this.getConversationTitle(
      this.redisClient,
      this.conversationId,
    );

    // If the conversation has just started, generate and set a title.
    if (conversationTitle == "") {
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Summarise the following message into a short title.",
          },
          // Caution: assumes that the first message is the system prompt,
          // and the second is the actual user input.
          { role: "user", content: newConversationHistory[1].content },
        ],
        model: this.model,
      });
      const conversationTitle = response.choices[0].message.content;
      await this.setConversationTitle(conversationTitle);
    }

    await this.redisClient.set(
      this.conversationId,
      JSON.stringify({
        messages: newConversationHistory,
        title: conversationTitle,
      }),
    );
  }

  async getConversationTitle() {
    const title = await JSON.parse(
      await this.redisClient.get(this.conversationId),
    ).title;
    return title;
  }

  async setConversationTitle(title) {
    const conversation = JSON.parse(
      await this.redisClient.get(this.conversationId),
    );
    await this.redisClient.set(
      this.conversationId,
      JSON.stringify({ messages: conversation.messages, title: title }),
    );
  }

  async chatCompletion(userInput) {
    let conversationHistory = await this.getConversationHistory();

    let currentMessage = { role: "user", content: userInput };
    conversationHistory.push(currentMessage);

    const response = await openai.chat.completions.create({
      messages: conversationHistory,
      model: this.model,
    });
    const modelMessage = response.choices[0].message;

    conversationHistory.push(modelMessage);
    await this.setConversationHistory(conversationHistory); // Update the message history with the latest replies.

    return modelMessage.content;
  }

  conversationLoop() {
    /** This is a mocked conversation loop to test exclusively server-side.
    In practice, the server will expose an API endpoint to call chatCompletion
    directly, and the client will handle the conversation loop.
    */
    return new Promise((resolve) => {
      const getUserInput = () => {
        this.rl.question("User: ", async (userInput) => {
          if (userInput == "end") {
            console.log("Ending conversation...");
            this.rl.close();
            resolve();
          } else {
            const modelResponse = await this.chatCompletion(userInput);
            console.log("Assistant: %s", modelResponse);
            getUserInput();
          }
        });
      };
      getUserInput();
    });
  }

  async start() {
    await this.connectRedis();
    await this.initConversation();
  }

  async end() {
    await this.redisClient.quit();
  }
}

async function main() {
  const conversation = new Conversation();
  const history = await conversation.start();

  console.log("Conversation loop over...");
  console.log("Conversation history: ", JSON.stringify(history, null, 2));
}

main();
