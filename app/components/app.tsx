import * as React from "react";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faExpand, faGear } from "@fortawesome/free-solid-svg-icons";

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
  const [showLeft, setShowLeft] = React.useState<boolean>(false);
  const [computedSettings] = useSettings();
  const [contextWindow] = useContextWindow();

  React.useEffect(() => {
    let id: string;

    socket.on("error", (error) => {
      toast.error(error.toString());
    });

    socket.on(
      "indexingProgress",
      ({ file, files, filename, chunk, chunks }) => {
        id = toast(
          (t) => {
            const filenameStyle: React.CSSProperties = {
              display: "flex",
              flexWrap: "nowrap",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: 12,
            };
            const filesProgressBarStyle: React.CSSProperties = {
              width: (file / files) * 100 + "%",
              height: 4,
              marginTop: 4,
              marginBottom: 16,
              backgroundColor: "rgba(0, 255, 0, 0.5)",
              borderRadius: 999,
            };

            const filepathParts = filename.split("/");
            const basename = filepathParts[filepathParts.length - 1];
            const dirname = filename.replace(basename, "");

            return (
              <div style={{ width: 240 }}>
                <div style={{ display: "flex" }}>
                  <span>Indexing {Math.floor((file / files) * 100)}%</span>
                  <span style={{ opacity: 0.5, marginLeft: "auto" }}>
                    {file}/{files}
                  </span>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.2)" }}>
                  <div style={filesProgressBarStyle}></div>
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {dirname}
                </div>
                <div style={filenameStyle}>
                  <span
                    style={{
                      flex: 1,
                      display: "inline-block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {basename}
                  </span>
                  <span style={{ flex: "0 0 auto" }}>[{chunk}]</span>
                </div>
                <div style={{ lineHeight: 0 }}>
                  {Array.from({ length: chunks }).map((_, i) => {
                    const isDone = i <= chunk;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "inline-block",
                          width: 3,
                          height: 3,
                          margin: "0 1px 1px 0",
                          background: isDone
                            ? "rgba(0, 192, 0, 0.7)"
                            : "rgba(0, 0, 0, 0.3)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          },
          { id },
        );
      },
    );

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
        containerStyle={{ top: 96, bottom: 128 }}
        toastOptions={{ className: "toast", duration: 3500 }}
        reverseOrder
      />

      {showLeft && (
        <div id="left">
          <div className="left__header">
            <SelectModel />
            <button
              className="button--icon button--transparent"
              style={{ position: "absolute", top: 10, right: 8, zIndex: 1 }}
              onClick={() => setShowLeft(false)}
            >
              <FontAwesomeIcon icon={faClose} />
            </button>
          </div>
          {contextWindow.messages.length > 0 ? (
            <div>
              <div className="left__header">
                <FontAwesomeIcon icon={faExpand} />
                &nbsp;Context Window ({contextWindow.tokens} tokens)
              </div>
              {contextWindow.messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
            </div>
          ) : systemPrompt ? (
            <div>
              <div className="left__header">
                <FontAwesomeIcon icon={faGear} />
                &nbsp;System Message ({systemPrompt.tokens} tokens)
              </div>
              <div style={{ padding: 8 }}>{systemPrompt.prompt}</div>
            </div>
          ) : null}
        </div>
      )}

      <div id="main">
        <div id="header">
          <div className="header__item">
            <Logo />
            {!showLeft && (
              <button
                className="button--transparent"
                onClick={() => setShowLeft(!showLeft)}
              >
                Debug
              </button>
            )}
          </div>
          <div className="header__item">
            <IndexProject />
            <SelectProject />
          </div>
          <div className="header__item">
            <button className="button--transparent" onClick={resetChat}>
              New Chat
            </button>
            {!showRight && (
              <button
                onClick={() => setShowRight(!showRight)}
                className="button--transparent"
              >
                Tools
              </button>
            )}
          </div>
        </div>
        <Chat />
      </div>

      {showRight && (
        <div id="right">
          <Tools />
          <button
            className="button--icon button--transparent"
            style={{ position: "absolute", top: 10, right: 16, zIndex: 1 }}
            onClick={() => setShowRight(false)}
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
      )}
      <img id="background" src={background} alt="Background" />
    </div>
  );
};
