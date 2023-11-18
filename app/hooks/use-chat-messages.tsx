import debug from "debug";
import * as React from "react";
import toast from "react-hot-toast";

import type {
  ChatMessagesByID,
  ServerToClientEvents,
} from "../../shared/types.js";
import { socket } from "../socket.io-client";
import type { ChatMessageCreationAttributes } from "../../server/models";
import { useIsFirstRender } from "./use-first-render";

const log = debug("gpp:app:hooks:use-chat-messages");

export const useChatMessagesByID = (): {
  chatMessagesByID: ChatMessagesByID | undefined;
  streaming: boolean;
} => {
  const isFirstRender = useIsFirstRender();
  const [chatMessagesByID, setMessagesByID] = React.useState<ChatMessagesByID>(
    {},
  );
  const [streaming, setStreaming] = React.useState<boolean>(false);

  const fetchMessages = async () => {
    fetch(`http://localhost:5004/chat/messages`)
      .then((res) => res.json())
      .then((res) => {
        log("initial chat messages", res);
        setMessagesByID(
          res.reduce(
            (acc: ChatMessagesByID, message: ChatMessageCreationAttributes) => {
              acc[message.id] = message;
              return acc;
            },
            {} as ChatMessagesByID,
          ),
        );
      })
      .catch((err) => {
        log(err);
        toast.error(`Get messages failed`);
      });
  };

  if (isFirstRender) {
    fetchMessages();
  }

  React.useEffect(() => {
    // Listen for new messages
    const handleChatMessageCreate: ServerToClientEvents["chatMessageCreate"] =
      ({ message }) => {
        setMessagesByID((prev) => {
          return { ...prev, [message.id]: message };
        });
      };

    const handleChatMessageStream: ServerToClientEvents["chatMessageStream"] =
      ({ chunk, id }) => {
        setStreaming(true);
        setMessagesByID((prev) => {
          const updatedMessage = {
            ...prev[id],
            content: prev[id].content + chunk,
          };
          return { ...prev, [id]: updatedMessage };
        });
      };

    const handleChatMessageStreamEnd: ServerToClientEvents["chatMessageStreamEnd"] =
      () => {
        setStreaming(false);
      };

    socket.on("connect", fetchMessages);
    socket.on("projectChanged", fetchMessages);
    socket.on("chatMessageCreate", handleChatMessageCreate);
    socket.on("chatMessageStream", handleChatMessageStream);
    socket.on("chatMessageStreamEnd", handleChatMessageStreamEnd);

    return () => {
      socket.off("connect", fetchMessages);
      socket.off("projectChanged", fetchMessages);
      socket.off("chatMessageCreate", handleChatMessageCreate);
      socket.off("chatMessageStream", handleChatMessageStream);
      socket.off("chatMessageStreamEnd", handleChatMessageStreamEnd);
    };
  }, []);

  return { chatMessagesByID, streaming };
};
