import * as React from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import mermaid from "mermaid";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark-reasonable.css";

import type { ChatMessageType } from "./types";
import { makeLogger } from "../../utils";

const log = makeLogger("components:chat-message");

export type ChatMessageProps = ChatMessageType;

const removeWrappingPTag = (html: string) => {
  if (html.startsWith("<p>") && html.endsWith("</p>")) {
    return html.slice(3, -4);
  }

  return html;
};

mermaid.initialize({
  securityLevel: "loose",
  startOnLoad: false,
});

export const ChatMessage = (props: ChatMessageProps) => {
  React.useEffect(() => {
    if (props.role !== "assistant") {
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
    }, 500);

    return () => clearTimeout(timeout);
  }, [props.content]);

  if (props.role === "user") {
    return (
      <div className={`chat-message chat-message--user`}>
        <div className="chat-message__container">
          <span className="chat-message__avatar">
            <i className="fa-regular fa-user"></i>
          </span>
          <span className="chat-message__content">{props.content}</span>
        </div>
      </div>
    );
  }

  if (props.role === "assistant") {
    const content = removeWrappingPTag(
      micromark(props.content, {
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
        </div>
      </div>
    );
  }

  if (props.role === "function") {
    let parsedContent = props.content;

    try {
      parsedContent = JSON.stringify(JSON.parse(props.content), null, 2);
    } catch (error) {
      log(
        "Could not format JSON function content, using original value.",
        props.content,
      );
    }

    return (
      <div className={`chat-message chat-message--function`}>
        <div className="chat-message__container">
          <span className="chat-message__avatar">
            <i className="fa fa-microchip"></i>
          </span>
          <span className="chat-message__content">
            <strong>{props.name}</strong>
            {" => "}
            {parsedContent}
          </span>
        </div>
      </div>
    );
  }

  if (props.role === "system") {
    return (
      <div className={`chat-message chat-message--system`}>
        <div className="chat-message__container">
          <span className="chat-message__content">
            <i className="fa fa-gear"></i>
            <strong> System Message </strong>
            {props.content}
          </span>
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
          <div>{props.role}</div>
          <div>{props.content}</div>
        </span>
      </div>
    </div>
  );
};
