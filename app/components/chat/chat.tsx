import type { FormEvent } from "react";
import * as React from "react";

import "./chat.css";

import { makeDebug } from "../../utils";
import { socket } from "../../socket.io-client";
import { ErrorBanner } from "../banner/error-banner";

import { ChatMessage } from "./chat-message";
// import { markdownKitchenSink } from "./markdown-kitchen-sink";
import type { ChatMessageType } from "./types";
import { useIsFirstRender } from "../../hooks/use-first-render";

const log = makeDebug("components:chat");

const suggestedMessages = [
  "Who am I?",
  "Where am I?",
  "What's the current project?",
  "What's my weather?",
  // `Make a guide on writing new tools.`,
  // markdownKitchenSink,
];

export const Chat = () => {
  const [messages, setMessages] = React.useState<ChatMessageType[]>([]);
  const [message, setMessage] = React.useState<string>("");
  const [reply, setReply] = React.useState<string>("");
  const isFirstRender = useIsFirstRender();

  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>("");

  // const chatMessagesRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // const scrollTimerRef = React.useRef(null);

  // const scrollToBottom = () => {
  //   const scroll = () => {
  //     // chatMessagesRef.current?.scrollTo({
  //     //   top: chatMessagesRef.current.scrollHeight,
  //     //   behavior: "smooth",
  //     // });
  //   };
  //
  //   // immediate first scroll
  //   if (scrollTimerRef.current === null) {
  //     scroll();
  //     return;
  //   }
  //
  //   // debounce future scrolls
  //   clearTimeout(scrollTimerRef.current);
  //
  //   scrollTimerRef.current = setTimeout(scroll, 1000);
  // };

  // scroll to bottom after activity stops
  // React.useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  React.useEffect(() => {
    // Get initial messages
    if (isFirstRender) {
      fetch(`http://localhost:5004/chat/messages`)
        .then((res) => res.json())
        .then((res) => {
          log("fetched chat messages", res);
          setMessages(res);
          setLoading(false);
        })
        .catch((err) => {
          log(err);
          setError(err.toString());
          setLoading(false);
        });
    }

    // Listen for new messages
    const handleNewChatMessage = ({ message }) => {
      log("newChatMessage", message);
      setMessages((prev) => [...prev, message]);
    };

    socket.on("newChatMessage", handleNewChatMessage);

    return () => {
      socket.off("newChatMessage", handleNewChatMessage);
    };
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
      setMessage("");
      // scrollToBottom();

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
                // scrollToBottom();
                return prevReply + decoded;
              });
              await read();
              return;
            }

            log("done");
            setReply("");
            setLoading(false);
            // scrollToBottom();
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

  // Focus ref after reply is set
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
      <div /* ref={chatMessagesRef} */ className="chat-messages">
        {messages.map((msg, index) => (
          <ChatMessage key={index} {...msg} />
        ))}
        {reply && <ChatMessage role="assistant" content={reply} />}
      </div>
      <div className="suggested-messages">
        {suggestedMessages.map((msg) => {
          const maxChars = 200 / suggestedMessages.length;
          return (
            <button
              key={msg}
              className="suggested-message"
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
      <div id="chat-messages-fade"></div>
      <div className="chat-form-glass"></div>
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
