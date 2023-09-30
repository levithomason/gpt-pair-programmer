import * as React from "react";
import { FormEvent } from "react";
import debug from "debug";

import "./chat.css";
import { Message } from "./types";
import { ChatMessage } from "./chat-message";
import { ErrorBanner } from "../banner/error-banner";
import { markdownKitchenSink } from "./markdown-kitchen-sink";

const log = debug("gpp:app:components:chat");

const suggestedMessages = [
  "Read the README.md",
  "Where am I?",
  "What's my weather?",
  `Make a guide on writing new tools.`,
  markdownKitchenSink,
];

export const Chat = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [message, setMessage] = React.useState<string>("");
  const [reply, setReply] = React.useState<string>("");

  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  const chatMessagesRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    chatMessagesRef.current?.scrollTo({
      top: chatMessagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // on first render
  React.useEffect(() => {
    // reset the chat
    fetch("http://localhost:5004/chat/new", { method: "POST" })
      .then(() => {
        log("Chat messages reset (POST /chat/new)");
      })
      .catch((err) => {
        log(err);
        setError("Failed to make a new chat.");
      });
  }, []);

  const handleSend = React.useCallback(
    async (e: FormEvent) => {
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

      const endpoint = `http://localhost:5004/chat`;
      const messageURI = encodeURIComponent(message);
      const getUrl = `${endpoint}?message=${messageURI}`;

      try {
        // abortRef.current = new AbortController();

        // https://stackoverflow.com/questions/31061838/how-to-cancel-an-http-fetch-request
        // signal: abortRef.current.signal,
        await fetch(getUrl).then(async (res) => {
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
                {
                  role: "assistant",
                  content: prevReply,
                  timestamp: Date.now(),
                },
              ]);
              return "";
            });
            setLoading(false);
            scrollToBottom();
          };

          await read();
        });
      } catch (err) {
        log(err);
        setError(err.toString());

        setLoading(false);
        abortRef.current = null;
      }
    },
    [message, loading],
  );

  React.useEffect(() => {
    if (!reply && !loading) {
      inputRef.current?.focus();
    }
  }, [reply, loading]);

  log("render", { messages, message, reply, loading, error });

  React.useEffect(() => {
    if (!error) return;

    const timeout = setTimeout(() => setError(""), 2000);

    return () => clearTimeout(timeout);
  }, [error]);

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
      <div
        style={{
          display: "flex",
          maxWidth: "80%",
          left: 0,
          right: 0,
          margin: "0 auto",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          position: "absolute",
          zIndex: 1,
          bottom: "100px",
        }}
      >
        {suggestedMessages.map((msg) => {
          const maxChars = 200 / suggestedMessages.length;
          return (
            <button
              key={msg}
              style={{
                maxWidth: "400px",
                height: "auto",
                color: "rgba(255, 255, 255, 0.6)",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
              onClick={(e) => {
                setMessage(msg);
                setTimeout(() => {
                  const button = document.querySelector(
                    "button[type=submit]",
                  ) as HTMLButtonElement;
                  button.click();
                }, 100);
              }}
            >
              {msg.length < maxChars
                ? msg
                : msg.slice(0, maxChars / 2) + "..." + msg.slice(-maxChars / 2)}
            </button>
          );
        })}
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
        {/*{typeof abortRef.current?.abort === "function" && (*/}
        {/*  <button*/}
        {/*    onClick={() => {*/}
        {/*      abortRef.current.abort();*/}
        {/*      setLoading(false);*/}
        {/*      abortRef.current = null;*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    Stop*/}
        {/*  </button>*/}
        {/*)}*/}
        <button type="submit" disabled={loading}>
          {loading ? "🤖" : "👉"}
        </button>
      </form>
    </div>
  );
};
