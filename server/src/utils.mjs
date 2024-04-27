import { createClient } from "redis";

export async function listAllConversations() {
  try {
    const redisClient = createClient();
    await redisClient.connect();

    // glob for all keys
    const keys = await redisClient.keys("*");

    if (keys.length == 0)
      console.log("Tried to list conversations but none exist yet!");

    await redisClient.quit();
    const conversations = await Promise.all(
      keys.map((key) => redisClient.get(key)),
    );

    // TODO: should be able to instantiate a `Conversation` object from this data

    return conversations;
  } catch (e) {
    console.log("Error occurred connecting to Redis!", e);
  }
}

async function main() {
  const keys = await listAllConversations();
  console.log(keys);
}
