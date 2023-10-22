import * as React from "react";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faGear } from "@fortawesome/free-solid-svg-icons";

import "./app.css";

import { socket } from "../socket.io-client";
import { makeDebug } from "../utils";
import background from "../../public/dark-gradient-background-with-copy-space.avif";

import { Chat } from "./chat/chat";
import { Logo } from "./logo/logo";
import { Tools } from "./tools/tools";
import { SelectProject } from "./select-project/select-project";
import { SelectModel } from "./select-project/select-model";
import { IndexProject } from "./index-project/index-project";

import { useSettings } from "../hooks/use-settings";
import { useContextWindow } from "../hooks/use-context-window";
import { ChatMessage } from "./chat/chat-message";

const log = makeDebug("components:app");

export const App = () => {
  const [systemPrompt, setSystemPrompt] = React.useState<{
    prompt: string;
    tokens: number;
  }>();
  const [showRight, setShowRight] = React.useState<boolean>(false);
  const [showLeft, setShowLeft] = React.useState<boolean>(true);
  const [computedSettings] = useSettings();
  const [contextWindow] = useContextWindow();

  React.useEffect(() => {
    let id: string;

    socket.on("indexingProgress", ({ file, files, filename, chunk }) => {
      id = toast(
        (t) => {
          const filenameStyle: React.CSSProperties = {
            width: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "rgba(255, 255, 255, 0.5)",
            whiteSpace: "nowrap",
            fontSize: 14,
          };
          const progressBarStyle: React.CSSProperties = {
            width: (file / files) * 100 + "%",
            height: 4,
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderRadius: 999,
          };

          const filepathParts = filename.split("/");
          // const root = filepathParts[0];
          const basename = filepathParts[filepathParts.length - 1];

          return (
            <div>
              <div>
                Indexing {file}/{files}
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.2)" }}>
                <div style={progressBarStyle}></div>
              </div>
              <div style={filenameStyle}>
                [{chunk}] {basename}
              </div>
            </div>
          );
        },
        { id },
      );
    });

    socket.on("indexingComplete", ({ files, chunks }) => {
      toast.success(`${files} files indexed (${chunks} chunks)`, { id });
    });

    return () => {
      socket.off("indexingProgress");
      socket.off("indexingComplete");
    };
  }, []);

  const resetChat = () => {
    if (
      !confirm(`DELETE all "${computedSettings?.settings.projectName}" chats?`)
    ) {
      return;
    }

    log("resetting chat");
    fetch(`http://localhost:5004/chat/new`, { method: "POST" }).then(() => {
      location.reload();
    });
  };

  React.useEffect(() => {
    log("fetching system prompt");
    fetch(`http://localhost:5004/prompts/system`)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        setSystemPrompt(json);
      })
      .catch((error) => {
        log("error", error);
      });
  }, [computedSettings]);

  log("render", { systemPrompt });

  return (
    <div id="app">
      <Toaster
        position="top-right"
        containerStyle={{ top: 64, bottom: 128 }}
        toastOptions={{ className: "toast", duration: 3500 }}
        reverseOrder
      />
      {showLeft && (
        <div id="left">
          {contextWindow.messages.length > 0 && (
            <div>
              <div style={{ padding: 4, background: "rgba(0, 0, 0, 0.25)" }}>
                <FontAwesomeIcon icon={faExpand} />
                &nbsp;Context Window ({contextWindow.tokens} tokens)
              </div>
              {contextWindow.messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
            </div>
          )}
          {systemPrompt?.prompt?.length > 0 && (
            <div>
              <div style={{ padding: 4, background: "rgba(0, 0, 0, 0.25)" }}>
                <FontAwesomeIcon icon={faGear} />
                &nbsp;System Message ({systemPrompt.tokens} tokens)
              </div>
              <div style={{ padding: 8 }}>{systemPrompt.prompt}</div>
            </div>
          )}
        </div>
      )}
      <div id="main">
        <div id="header">
          <div className="header__item">
            <Logo hideText={showLeft} />
          </div>
          <div className="header__item">
            <IndexProject />
            <SelectProject />
            <SelectModel />
          </div>
          <div className="header__item">
            <button
              className="button--transparent"
              onClick={() => setShowLeft(!showLeft)}
            >
              Debug
            </button>
            <button className="button--transparent" onClick={resetChat}>
              New Chat
            </button>
            <button
              onClick={() => setShowRight(!showRight)}
              className="button--transparent"
            >
              Tools
            </button>
          </div>
        </div>
        <Chat />
      </div>
      {showRight && (
        <div id="right">
          <Tools />
        </div>
      )}
      <img id="background" src={background} alt="Background" />
    </div>
  );
};
