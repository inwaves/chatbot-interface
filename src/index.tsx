import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const API_URL = "http://localhost:3001/api/read_conversation";

const fetchConversationData = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch conversation data");
  }
  console.log("response", response);
  return response.json();
};

const App = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchConversationData().then(setData).catch(console.error);
  }, []);
  console.log("Data in App is:", data);
  return <div>{data ? JSON.stringify(data) : "Loading..."}</div>;
};
const rootContainer = document.getElementById("root");

if (rootContainer) {
  const root = createRoot(rootContainer);
  root.render(<App />);
}
