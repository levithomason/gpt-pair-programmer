import type { FormEvent } from "react";
import * as React from "react";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faCircleStop } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./chat.css";

import { makeDebug } from "../../utils";

import { ChatMessage } from "./chat-message";
// import { markdownKitchenSink } from "./markdown-kitchen-sink";
import { useSettings } from "../../hooks/use-settings";
import toast from "react-hot-toast";
import { useChatMessagesByID } from "../../hooks/use-chat-messages";

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
  const { chatMessagesByID, streaming } = useChatMessagesByID();
  const [userMessage, setUserMessage] = React.useState<string>("");
  const [settings] = useSettings();

  const chatMessagesRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  const handleSend = React.useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (streaming || !userMessage.trim()) {
        inputRef.current?.focus();
        return;
      }

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
        toast.error(`Posting /chat failed`);
      }
    },
    [userMessage, streaming],
  );

  log("render", { chatMessagesByID, userMessage, streaming });

  let runningInputTokens = 0;
  let runningOutputTokens = 0;

  return (
    <div id="chat">
      <div ref={chatMessagesRef} className="chat-messages">
        {Object.values(chatMessagesByID).map((msg, index) => {
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
          {streaming ? (
            <FontAwesomeIcon icon={faCircleStop} />
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} />
          )}
        </button>
      </form>
    </div>
  );
};
