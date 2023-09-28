import * as React from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import hljs from "highlight.js";

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

export const ChatMessage = (props: ChatMessageProps) => {
  React.useLayoutEffect(() => {
    hljs.highlightAll();
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
