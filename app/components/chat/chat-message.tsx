import * as React from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import mermaid from "mermaid";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark-reasonable.css";

import type { ChatMessageAttributes } from "../../../server/models";
import { makeDebug } from "../../utils";

const log = makeDebug("components:chat-message");

export type ChatMessageProps = {
  message: ChatMessageAttributes;
  runningInputTokens: number;
  runningOutputTokens: number;
  cost: number;
};

const removeWrappingPTag = (html: string) => {
  if (html.startsWith("<p>") && html.endsWith("</p>")) {
    return html.slice(3, -4);
  }

  return html;
};

mermaid.initialize({
  securityLevel: "loose",
  startOnLoad: false,
  theme: "dark",
});

export const ChatMessage = (props: ChatMessageProps) => {
  const { message, runningInputTokens, runningOutputTokens, cost } = props;
  React.useEffect(() => {
    if (message.role !== "assistant") {
      return;
    }

    hljs.highlightAll();

    const timeout = setTimeout(() => {
      mermaid
        .run({
          querySelector: ".language-mermaid",
        })
        .catch((error) => {
          log(error);
        })
        .finally(() => {});
    }, 1000);

    return () => clearTimeout(timeout);
  }, [message.content]);

  const details = (
    <div className="chat-message-details">
      <span className="chat-message-details__item">
        {runningInputTokens}
        <i className="fa fa-arrow-right-to-bracket"></i>
      </span>
      <span className="chat-message-details__item">
        {runningOutputTokens}
        <i className="fa fa-arrow-right-from-bracket"></i>
      </span>
      <span className="chat-message-details__item">
        <i className="fa fa-equals"></i>
        {runningInputTokens + runningOutputTokens}
      </span>
      <span className="chat-message-details__item">
        {cost.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </span>
    </div>
  );

  if (message.role === "user") {
    return (
      <div className={`chat-message chat-message--user`}>
        <div className="chat-message__container">
          <span className="chat-message__avatar">
            <i className="fa-regular fa-user"></i>
          </span>
          <span className="chat-message__content">{message.content}</span>
          {details}
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    const content = removeWrappingPTag(
      micromark(message.content, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()],
      }),
    );

    return (
      <div className={`chat-message chat-message--assistant`}>
        <div className="chat-message__container">
          <span className="chat-message__avatar">
            <i className="fa fa-robot"></i>
          </span>
          <span
            className="chat-message__content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          {details}
        </div>
      </div>
    );
  }

  if (message.role === "function") {
    let parsedContent = message.content;

    try {
      parsedContent = JSON.stringify(JSON.parse(message.content), null, 2);
    } catch (error) {
      log(
        "Could not format JSON function content, using original value.",
        message.content,
      );
    }

    return (
      <div className={`chat-message chat-message--function`}>
        <div className="chat-message__container">
          <span className="chat-message__avatar">
            <i className="fa fa-code"></i>
          </span>
          <span className="chat-message__content">
            <strong>{message.name}</strong>
            {` => ${parsedContent}`}
          </span>
          {details}
        </div>
      </div>
    );
  }

  if (message.role === "system") {
    return (
      <div className={`chat-message chat-message--system`}>
        <div className="chat-message__container">
          <span className="chat-message__avatar">
            <i className="fa fa-gear"></i>
          </span>
          <span className="chat-message__content">
            <strong>System &mdash; </strong>
            {message.content}
          </span>
          {details}
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-message`}>
      <div className="chat-message__container">
        <span className="chat-message__avatar">
          <i className={"fa fa-warning"}></i>
        </span>
        <span className="chat-message__content">
          Unknown message type:
          <div>{message.role}</div>
          <div>{message.content}</div>
        </span>
      </div>
    </div>
  );
};
