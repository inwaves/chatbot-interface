import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const API_URL = "http://localhost:3001/api";

const endpoints = {
  list_all_conversations: "/list_all_conversations",
  get_conversation: "/get_conversation",
  send_message: "/send_message",
};

const getConversation = async () => {
  const response = await fetch(API_URL + endpoints["get_conversation"]);
  if (!response.ok) {
    throw new Error("Failed to get conversation data!");
  }
  return response.json();
};

const sendMessage = async (message: String) => {
  try {
    const response = await fetch(API_URL + endpoints["send_message"], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error("Failed to send message!");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send message!", error);
  }
};

const App = () => {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [serverResponse, setServerResponse] = useState("");

  useEffect(() => {
    getConversation().then(setData).catch(console.error);
  }, []);

  const handleSendMessage = async () => {
    const response = await sendMessage(message);
    if (response) {
      setServerResponse(response);
    }
    setMessage("");
  };

  let body = (
    <div>
      <div>{data ? JSON.stringify(data) : "Loading..."}</div>
      <br />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type here..."
      />
      <button type="button" onClick={handleSendMessage}>
        Send
      </button>
      <div>
        <pre>{serverResponse ? JSON.stringify(serverResponse) : ""}</pre>
      </div>
    </div>
  );

  return body;
};

const rootContainer = document.getElementById("root");

if (rootContainer) {
  const root = createRoot(rootContainer);
  root.render(<App />);
}
