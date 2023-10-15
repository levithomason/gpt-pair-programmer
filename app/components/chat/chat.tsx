import type { FormEvent } from "react";
import * as React from "react";

import "./chat.css";

import type {
  ChatMessage as ChatMessageType,
  ChatMessageCreationAttributes,
} from "../../../server/models";

import { makeDebug } from "../../utils";
import { socket } from "../../socket.io-client";
import { ErrorBanner } from "../banner/error-banner";

import { ChatMessage } from "./chat-message";
// import { markdownKitchenSink } from "./markdown-kitchen-sink";
import { useIsFirstRender } from "../../hooks/use-first-render";
import type { ServerToClientEvents } from "../../../types";
import { useSettings } from "../../hooks/use-settings";

const log = makeDebug("components:chat");

const suggestedMessages = [
  "Who am I?",
  "Where am I?",
  "What's the current project?",
  "What's my weather?",
  // `Make a guide on writing new tools.`,
  // markdownKitchenSink,
];

type MessagesByID = {
  [id in ChatMessageType["id"]]: ChatMessageCreationAttributes;
};

export const Chat = () => {
  const [messagesByID, setMessagesByID] = React.useState<MessagesByID>({});
  const [userMessage, setUserMessage] = React.useState<string>("");
  const [streaming, setStreaming] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [settings] = useSettings();

  const chatMessagesRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isFirstRender = useIsFirstRender();

  const scrollToBottom = () => {
    log("scrollToBottom", chatMessagesRef.current);
    chatMessagesRef.current?.scrollTo({
      top: chatMessagesRef.current?.scrollHeight,
      behavior: "instant",
    });
  };

  // scroll to bottom if needed
  const lastScrollHeight = React.useRef<number>(
    chatMessagesRef.current?.scrollHeight || 0,
  );
  React.useEffect(() => {
    const didScrollHeightChange =
      chatMessagesRef.current?.scrollHeight !== lastScrollHeight.current;

    if (didScrollHeightChange) {
      scrollToBottom();
    }

    lastScrollHeight.current = chatMessagesRef.current?.scrollHeight;
  });

  React.useEffect(() => {
    // Get initial messages
    if (isFirstRender) {
      fetch(`http://localhost:5004/chat/messages`)
        .then((res) => res.json())
        .then((res) => {
          log("initial chat messages", res);
          setMessagesByID(
            res.reduce((acc: MessagesByID, message: ChatMessageType) => {
              acc[message.id] = message;
              return acc;
            }, {} as MessagesByID),
          );
        })
        .catch((err) => {
          log(err);
          setError(err.toString());
        });
    }

    // Listen for new messages
    const handleChatMessageCreate: ServerToClientEvents["chatMessageCreate"] =
      ({ message }) => {
        setMessagesByID((prev) => {
          return { ...prev, [message.id]: message };
        });
      };

    const handleChatMessageStream: ServerToClientEvents["chatMessageStream"] =
      ({ chunk, id }) => {
        setStreaming(true);
        setMessagesByID((prev) => {
          const updatedMessage = {
            ...prev[id],
            content: prev[id].content + chunk,
          };
          return { ...prev, [id]: updatedMessage };
        });
      };

    const handleChatMessageStreamEnd: ServerToClientEvents["chatMessageStreamEnd"] =
      () => {
        setStreaming(false);
      };

    socket.on("chatMessageCreate", handleChatMessageCreate);
    socket.on("chatMessageStream", handleChatMessageStream);
    socket.on("chatMessageStreamEnd", handleChatMessageStreamEnd);

    return () => {
      socket.off("chatMessageCreate", handleChatMessageCreate);
      socket.off("chatMessageStream", handleChatMessageStream);
    };
  }, [isFirstRender]);

  const handleSend = React.useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (streaming || !userMessage.trim()) return;

      setUserMessage("");

      try {
        await fetch(`http://localhost:5004/chat`, {
          method: "POST",
          body: JSON.stringify({ message: userMessage }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        log(err);
        setError(err.toString());
      }
    },
    [userMessage, streaming],
  );

  log("render", { messagesByID, userMessage, streaming, error });

  React.useEffect(() => {
    if (!error) return;

    const timeout = setTimeout(() => setError(""), 2000);

    return () => clearTimeout(timeout);
  }, [error]);

  let runningInputTokens = 0;
  let runningOutputTokens = 0;

  return (
    <div id="chat">
      <ErrorBanner error={error} />
      <div ref={chatMessagesRef} className="chat-messages">
        {Object.values(messagesByID).map((msg, index) => {
          if (msg.role === "assistant") runningOutputTokens += msg.tokens;
          else runningInputTokens += msg.tokens;

          const model = settings?.model;

          return (
            <ChatMessage
              key={msg.id}
              message={msg}
              runningInputTokens={runningInputTokens}
              runningOutputTokens={runningOutputTokens}
              cost={
                model
                  ? // TODO: this is a poor-man's cost calculation
                    //  cost is only incurred on LLM call
                    //  it should be calc'd on call and stored in the DB if we're going to do this
                    (runningInputTokens / 1000) * model.inputCost +
                    (runningOutputTokens / 1000) * model.outputCost
                  : 0
              }
            />
          );
        })}
      </div>
      <div className="suggested-messages">
        {suggestedMessages.map((msg) => {
          const maxChars = 200 / suggestedMessages.length;
          return (
            <button
              key={msg}
              className="suggested-message"
              onClick={(e) => {
                setUserMessage(msg);
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
          placeholder={streaming ? "" : "Send a message"}
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <button type="submit" disabled={streaming}>
          {streaming ? "🤖" : "👉"}
        </button>
      </form>
    </div>
  );
};
