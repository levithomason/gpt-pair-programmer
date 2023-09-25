import * as React from "react";
import { FormEvent } from "react";
import debug from "debug";

import { ChatMessage } from "./chat-message";
import { ErrorBanner } from "../banner/error-banner";
import "./chat.css";
import { Message } from "./types";

const log = debug("gpp:app:components:chat");

export const Chat = () => {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "user",
      content: "What is your name?",
      timestamp: Date.now(),
    },
    {
      role: "assistant",
      content: "Hello, I'm GPT-3.",
      timestamp: Date.now(),
    },
    {
      role: "assistant",
      content: "What can I help you with?",
      timestamp: Date.now(),
    },
    {
      role: "user",
      content: "test",
      timestamp: Date.now(),
    },
    {
      role: "assistant",
      content:
        'There are many ways to interpret the word "test." In the context of a question or prompt, it usually implies assessing someone\'s knowledge or skills. It can also refer to an examination or assessment given in an academic or professional setting. In some cases, a test may be used to evaluate the effectiveness or functionality of a product or system. Overall, a test can serve as a measure of performance, understanding, or quality.',
      timestamp: Date.now(),
    },
    {
      role: "user",
      content:
        "Make a table of car accidents by year in the US compared to motorcycles",
      timestamp: Date.now(),
    },
    {
      role: "assistant",
      content: `| Year | Car Accidents (US) | Motorcycle Accidents (US) |\n| ---- | ------------------ | ------------------------- |\n| 2015 | 6,296,000 | 88,000 |\n| 2016 | 6,821,000 | 95,000 |\n| 2017 | 6,452,000 | 89,000 |\n| 2018 | 6,734,000 | 91,000 |\n| 2019 | 6,756,000 | 88,000 |`,
      timestamp: Date.now(),
    },
  ]);
  const [message, setMessage] = React.useState<string>("");
  const [reply, setReply] = React.useState<string>("");

  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  const chatMessagesRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatMessagesRef.current?.scrollTo({
      top: chatMessagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSend = React.useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      if (loading) {
        return;
      }

      if (!message.trim()) {
        setMessage("");
        return;
      }

      setLoading(true);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message, timestamp: Date.now() },
      ]);
      setMessage("");
      scrollToBottom();

      const messageURI = encodeURIComponent(message);
      const url = `http://localhost:5004/chat?message=${messageURI}`;

      fetch(url).then(async (res) => {
        log("res", res);
        const reader = res.body!.getReader();

        log("reader", reader);
        const decoder = new TextDecoder();

        const read = async () => {
          const { done, value } = await reader.read();
          const decoded = decoder.decode(value);
          log(decoded);

          if (!done) {
            setReply((prevReply) => {
              scrollToBottom();
              return prevReply + decoded;
            });
            await read();
            return;
          }

          log("done");
          setReply((prevReply) => {
            setMessages((prevMessages) => [
              ...prevMessages,
              { role: "assistant", content: prevReply, timestamp: Date.now() },
            ]);
            return "";
          });
          setLoading(false);
          scrollToBottom();
        };

        await read();
      });
    },
    [message, loading],
  );

  React.useEffect(() => {
    if (!reply && !loading) {
      inputRef.current?.focus();
    }
  }, [reply, loading]);

  log("render", { messages, message, reply, loading, error });

  return (
    <div id="chat">
      <ErrorBanner error={error} />
      <div ref={chatMessagesRef} className="chat-messages">
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role}>
            {msg.content}
          </ChatMessage>
        ))}
        {reply && <ChatMessage role="assistant">{reply}</ChatMessage>}
      </div>
      <form onSubmit={handleSend} className="chat-form">
        <input
          ref={inputRef}
          disabled={loading}
          placeholder={loading ? "" : "Send a message"}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "🤖" : "👉"}
        </button>
      </form>
    </div>
  );
};
