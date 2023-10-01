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
  const lastRenderTime = React.useRef<number>(Date.now());

  let parsedContent = props.content;

  if (props.role === "function") {
    try {
      parsedContent = JSON.stringify(JSON.parse(props.content), null, 2);
    } catch (error) {
      log(
        "Could not format JSON function content, using original value.",
        props.content,
      );
    }
  }

  React.useEffect(() => {
    if (props.role !== "assistant") {
      return;
    }

    hljs.highlightAll();

    if (Date.now() - lastRenderTime.current < 1000) {
      mermaid
        .run({
          querySelector: ".language-mermaid",
        })
        .catch((error) => {
          log(error);
        });
    }
  }, [props.content]);

  const className = `chat-message chat-message--${props.role}`;

  if (props.role === "user" || props.role === "assistant") {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{
          __html: removeWrappingPTag(
            micromark(parsedContent, {
              extensions: [gfm()],
              htmlExtensions: [gfmHtml()],
            }),
          ),
        }}
      />
    );
  }

  // system or function message
  return (
    <div className={className}>
      <span style={{ fontWeight: "bold", mixBlendMode: "overlay" }}>
        {props.name || props.role.toUpperCase()}
        {" => "}
      </span>
      {parsedContent}
    </div>
  );
};
