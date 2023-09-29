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
  const lastRenderTime = React.useRef<number>(Date.now());

  React.useEffect(() => {
    if (props.role !== "assistant") {
      return;
    }

    console.log(props.role, props.children);

    hljs.highlightAll();

    if (Date.now() - lastRenderTime.current < 1000) {
      mermaid.run({
        querySelector: ".language-mermaid",
      });
    }
  }, [props.role, props.children]);

  return (
    <div
      className={`chat-message chat-message--${props.role}`}
      dangerouslySetInnerHTML={{
        __html:
          `ROLE: ${props.role}:` +
          removeWrappingPTag(
            micromark(props.children, {
              extensions: [gfm()],
              htmlExtensions: [gfmHtml()],
            }),
          ),
      }}
    />
  );
};
