import * as React from "react";
import axios from "axios";
import debug from "debug";

import { ChatMessage } from "./chat-message";
import * as events from "events";

const log = debug("app:components:chat");

export const Chat = () => {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState<string>("ping");
  const [error, setError] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSend = React.useCallback(() => {
    setLoading(true);
    log("messages", messages);

    const url = `http://0.0.0.0:5004/chat?message=${encodeURIComponent(
      message,
    )}`;

    log("url", url);
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      log("Received data:", event.data);

      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    eventSource.onerror = (event) => {
      log("EventSource failed:", event);
      eventSource.close();
      setError("Error receiving message from server.");
    };

    return () => {
      eventSource.close();
    };
  }, [message, messages]);

  log("messages", messages);

  return (
    <div>
      <div
        style={{
          transition: "all 0.5s ease-in-out",
          position: "fixed",
          padding: "1rem 2rem",
          margin: "0 auto",
          top: "-100px",
          width: "calc(100% - 4rem)",
          minWidth: "400px",
          maxWidth: "800px",
          textAlign: "center",
          color: "white",
          backgroundColor: "#D88",
          borderRadius: "8px",
          opacity: 0,
          ...(error && {
            top: "16px",
            opacity: 1,
          }),
        }}
      >
        {error}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
      <div>
        {messages.map((msg, index) => (
          <ChatMessage key={index}>{msg}</ChatMessage>
        ))}
      </div>
    </div>
  );
};
