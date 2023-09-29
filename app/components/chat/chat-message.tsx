import * as React from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import mermaid from "mermaid";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark-reasonable.css";

import { MessageRole } from "./types";

export type ChatMessageProps = {
  children: string;
  role: MessageRole;
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
});
export const ChatMessage = (props: ChatMessageProps) => {
  React.useEffect(() => {
    hljs.highlightAll();
    mermaid.run({
      querySelector: ".language-mermaid",
    });
  });

  return (
    <div
      className={`chat-message chat-message--${props.role}`}
      dangerouslySetInnerHTML={{
        __html: removeWrappingPTag(
          micromark(props.children, {
            extensions: [gfm()],
            htmlExtensions: [gfmHtml()],
          }),
        ),
      }}
    />
  );
};
