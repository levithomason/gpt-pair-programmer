import type { FormEvent } from "react";
import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faCircleStop } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./chat.css";

import { makeDebug } from "../../utils";

import { ChatMessage } from "./chat-message";
// import { markdownKitchenSink } from "./markdown-kitchen-sink";
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

  const chatMessagesRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

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
    (e: FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();

      if (streaming || !userMessage.trim()) {
        inputRef.current?.focus();
        return;
      }

      setUserMessage("");

      fetch(`http://localhost:5004/chat`, {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
        headers: { "Content-Type": "application/json" },
      }).catch((err) => {
        log(err);
        toast.error(`Posting /chat failed`);
      });
    },
    [userMessage, streaming],
  );

  log("render", { chatMessagesByID, userMessage, streaming });

  return (
    <div id="chat">
      <div ref={chatMessagesRef} className="chat-messages">
        {Object.values(chatMessagesByID).map((msg) => {
          return <ChatMessage key={msg.id} message={msg} />;
        })}
      </div>
      <div className="suggested-messages">
        {suggestedMessages.map((msg) => {
          const maxChars = 200 / suggestedMessages.length;
          return (
            <button
              key={msg}
              className="suggested-message"
              onClick={() => {
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
      <form onSubmit={handleSend} className="chat-form">
        <TextareaAutosize
          className="chat-form__input"
          ref={inputRef}
          placeholder="Send a message"
          value={userMessage}
          onKeyDown={(e) => {
            const hasNewLines = /\n/.test(userMessage);
            const isSubmitKeyCombo = hasNewLines
              ? e.key === "Enter" && e.metaKey && !e.shiftKey
              : e.key === "Enter" && !e.shiftKey;

            if (isSubmitKeyCombo) {
              handleSend(e);
            }
          }}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <button
          className="chat-form__submit"
          type="submit"
          disabled={streaming}
        >
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
