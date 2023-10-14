import * as React from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import mermaid from "mermaid";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark-reasonable.css";

import type { ChatMessageAttributes } from "../../../server/models";
import { makeDebug } from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faCode,
  faEquals,
  faGear,
  faRobot,
  faUser,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";

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
        <FontAwesomeIcon icon={faArrowRightToBracket} />
      </span>
      <span className="chat-message-details__item">
        {runningOutputTokens}
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      </span>
      <span className="chat-message-details__item">
        <FontAwesomeIcon icon={faEquals} />
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
            <FontAwesomeIcon icon={faUser} />
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
            <FontAwesomeIcon icon={faRobot} />
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

    // TODO: we're making stored function return values look like:
    //       - strings: to keep new lines
    //       - objects: when JSON is returned
    //   However, the model is always going to receive the data from the db, string.
    //   Consider returning the proper type (string or JSON) from the DB.
    //   This way, tool endpoints also can return JSON if needed.
    try {
      parsedContent = JSON.parse(message.content);
      if (typeof parsedContent !== "string") {
        parsedContent = JSON.stringify(parsedContent, null, 2);
      }
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
            <FontAwesomeIcon icon={faCode} />
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
            <FontAwesomeIcon icon={faGear} />
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
          <FontAwesomeIcon icon={faWarning} />
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
