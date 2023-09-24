import * as React from "react";
import "./chat-message.css";

export type ChatMessageProps = {
  children: React.ReactNode;
};

export const ChatMessage = (props: ChatMessageProps) => {
  return <div className="chat-message">{props.children}</div>;
};
