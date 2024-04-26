import readline from "node:readline";
import OpenAI from "openai";
import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const systemPrompt = "You are a helpful AI assistant.";

const openai = new OpenAI();

async function getConversationHistory(redisClient, conversationId) {
  /** Retrieves the conversation history from the persistence layer.
   * @param: redisClient: The Redis client object.
   * @param: conversationId: The unique identifier for the conversation.
   * @return: The conversation history as an array of messages.
   */

  const conversationString = await redisClient.get(conversationId);
  const conversationHistory = JSON.parse(conversationString);

  // Some sanity checks.
  assert("messages" in conversationHistory && "title" in conversationHistory);
  assert(
    typeof conversationHistory.messages === "array" &&
      typeof conversationHistory.title === "string",
  );

  return conversationHistory.messages;
}

async function setConversationHistory(
  redisClient,
  conversationId,
  newConversationHistory,
) {
  /** Sets the conversation history in the persistence layer.
   * @param: redisClient: The Redis client object.
   * @param: conversationId: The unique identifier for the conversation.
   * @param: newConversationHistory: The updated conversation history.
   */

  const conversationTitle = await getConversationTitle(
    redisClient,
    conversationId,
  );

  // If the conversation has just started, generate and set a title.
  if (conversationTitle == "") {
    const conversationTitle = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Summarise the following message into a short title.",
        },
        // Caution: assumes that the first message is the system prompt,
        // and the second is the actual user input.
        { role: "user", content: newConversationHistory[1].content },
      ],
    }).choices[0].message.content;
    setConversationTitle(redisClient, conversationId, conversationTitle);
  }

  await redisClient.set(
    conversationId,
    JSON.stringify({
      messages: newConversationHistory,
      title: conversationTitle,
    }),
  );
}

async function getConversationTitle(redisClient, conversationId) {
  return await JSON.parse(redisClient.get(conversationId)).title;
}

async function setConversationTitle(redisClient, conversationId, title) {
  const conversation = JSON.parse(await redisClient.get(conversationId));
  await redisClient.set(
    conversationId,
    JSON.stringify({ messages: conversation.messages, title: title }),
  );
}

async function chatCompletion(userInput, model = "gpt-3.5-turbo") {
  let conversationHistory = getConversationHistory();

  let currentMessage = { role: "user", content: userInput };
  conversationHistory.push(currentMessage);

  const response = await openai.chat.completions.create({
    messages: conversationHistory,
    model: model,
  });
  const modelMessage = response.choices[0].message;

  conversationHistory.push(modelMessage);
  setConversationHistory(conversationHistory); // Update the message history with the latest replies.

  return modelMessage.content;
}

function conversationLoop() {
  rl.question("User: ", async (question) => {
    const modelResponse = await chatCompletion(question);
    console.log("Assistant: %s", modelResponse);
    conversationLoop();
  });
}

async function main() {
  const conversationId = uuidv4();
  console.log("Starting a new conversation with id: %s", conversationId);

  // TODO: Connect Redis as persistence layer.
  try {
    const redisClient = createClient();
    await redisClient.connect();

    console.log("Connected to redisClient!");

    await redisClient.set(
      conversationId,
      JSON.stringify({
        messages: [{ role: "system", content: systemPrompt }],
        title: "",
      }),
    );

    const value = await redisClient.get(conversationId);
    console.log(
      "The conversationId was: %s\nHere is the placeholder: %s",
      conversationId,
      value,
    );

    // conversationLoop();

    await redisClient.quit();
  } catch (e) {
    console.error(e);
  }
}

main();
