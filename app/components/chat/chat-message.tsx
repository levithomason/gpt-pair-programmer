import * as React from "react";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
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

export const ChatMessage = (props: ChatMessageProps) => {
  React.useEffect(() => {
    document.querySelectorAll("pre > code").forEach((el) => {
      console.log(el);
      hljs.highlightElement(el as HTMLElement);
    });
    console.log("highlighted");
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
