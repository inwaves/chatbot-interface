import OpenAI from "openai"
import readline from "node:readline";
import createClient from "redis";
import { v4 as uuidv4 } from "uuid";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const openai = new OpenAI();
let messageHistory = [{ role: "system", content: "You are a helpful AI assistant." }];

function getMessageHistory() {
  /* Gets the message history for the current conversation from the persistence layer.*/
  return messageHistory;
}

function writeMessageHistory(newMessageHistory) {
  /* Writes the message history for the current conversation to the persistence layer.*/
  messageHistory = newMessageHistory;
}

async function chatCompletion(userInput, model = "gpt-3.5-turbo") {
  let messageHistory = getMessageHistory();

  if (messageHistory.length == 1) {
    let conversationTitle = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Summarise the following message into a short title." },
        { role: "user", content: userInput },
      ],
      model: model
    });

    // Write this to persistence layer...
  }
  let currentMessage = { role: "user", content: userInput };
  messageHistory.push(currentMessage);

  const response = await openai.chat.completions.create({
    messages: messageHistory,
    model: model,
  });
  const modelMessage = response.choices[0].message;

  messageHistory.push(modelMessage);
  writeMessageHistory(messageHistory); // Update the message history with the latest replies.

  return modelMessage.content;
}

function conversationLoop() {
  rl.question("User: ", async question => {
    const modelResponse = await chatCompletion(question);
    console.log("Assistant: %s", modelResponse);
    conversationLoop();
  });
}

function main() {
  // try {
  //   const client = createClient();
  //   await client.connect();
  //
  //   for await (const { hashkey, conversation } of client.zScanIterator("conversations")) {
  //     console.log("${hashkey} -> ${score}");
  //   }
  // }

  const uid = uuidv4();
  console.log("Starting a new conversation with id: %s", uid)
  conversationLoop();
}

main();
