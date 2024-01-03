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

function formatTime(milliseconds: number) {
  if (!milliseconds) return "...";

  // Calculate hours, minutes and seconds
  const seconds: number = Math.floor(milliseconds / 1000);
  let minutes: number | string = Math.floor(seconds / 60);
  let hours: number | string = Math.floor(minutes / 60);

  // Modulo operation to get remaining minutes and seconds
  minutes = minutes % 60;

  // Adding leading zero if the number is less than 10
  hours = hours < 10 ? hours : hours;
  minutes = minutes < 10 ? minutes : minutes;

  if (hours) {
    return `${hours}h ${minutes}min`;
  }

  if (minutes) {
    return `${minutes}min`;
  }

  return `< 1min`;
}

export const App = () => {
  const [systemPrompt, setSystemPrompt] = React.useState<{
    prompt: string;
    tokens: number;
  }>();
  const [showRight, setShowRight] = React.useState<boolean>(
    localStorage.getItem("app.showRight") === "true",
  );
  const [showLeft, setShowLeft] = React.useState<boolean>(
    localStorage.getItem("app.showLeft") === "true",
  );
  const [computedSettings] = useSettings();
  const [contextWindow] = useContextWindow();

  localStorage.setItem("app.showRight", showRight.toString());
  localStorage.setItem("app.showLeft", showLeft.toString());

  React.useEffect(() => {
    let id: string;
    const times: number[] = [];
    let timeStart = 0;
    let prevFilename: string;
    let timeRemaining = 0;

    socket.on("error", (error) => {
      toast.error(error.toString());
    });

    socket.on(
      "indexingProgress",
      ({ file, files, filename, chunk, chunks }) => {
        id = toast(
          () => {
            // set timeStart
            if (!timeStart) timeStart = Date.now();

            // handle file change
            if (prevFilename !== filename) {
              const NOW = Date.now();
              times.push(NOW - timeStart);
              if (times.length > 100) times.shift();

              const timeAvg = times.reduce((a, b) => a + b, 0) / times.length;
              const filesRemaining = files - file;
              timeRemaining = filesRemaining * timeAvg;

              prevFilename = filename;
              timeStart = NOW;
            }

            const parts = filename.split("/");
            const name = parts.pop();
            const lastPartOfPath = "/" + parts.pop();
            const firstPartsOfPath = parts.join("/");

            // Extract the file extension and file name without extension
            const dotIndex = name.indexOf(".");
            const fileNameWithoutExt =
              dotIndex > 0 ? name.substring(0, dotIndex) : name;
            const extension = dotIndex > 0 ? name.substring(dotIndex) : "";

            return (
              <div style={{ width: 240 }}>
                <div style={{ display: "flex" }}>
                  <span>Indexing {Math.floor((file / files) * 100)}%</span>

                  {/* TIME REMAINING */}
                  <span style={{ opacity: 0.5, marginLeft: "auto" }}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>

                {/* PROGRESS BAR */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: 999,
                  }}
                >
                  <div
                    style={{
                      width: (file / files) * 100 + "%",
                      height: 4,
                      marginTop: 4,
                      marginBottom: 4,
                      backgroundColor: "rgba(0, 255, 0, 0.5)",
                      borderRadius: 999,
                    }}
                  ></div>
                </div>

                {/* FILES */}
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: 12,
                    textAlign: "right",
                  }}
                >
                  {file} <span style={{ opacity: 0.5 }}>of</span> {files}
                </div>

                {/* DIRNAME */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    marginTop: 8,
                  }}
                >
                  <span
                    style={{
                      flex: "0 1 auto",
                      display: "inline-block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {firstPartsOfPath}
                  </span>
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "inline-block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lastPartOfPath}
                  </span>
                </div>

                {/* FILENAME */}
                <div
                  style={{
                    display: "flex",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      flex: "0 1 auto",
                      display: "inline-block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fileNameWithoutExt}
                  </span>
                  <span
                    style={{
                      flex: "0 0 auto",
                      display: "inline-block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {extension}
                  </span>
                </div>

                {/* CHUNKS */}
                <div style={{ lineHeight: 0 }}>
                  {Array.from({ length: chunks }).map((_, i) => {
                    const isDone = i <= chunk;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "block",
                          float: "left",
                          width: 28,
                          height: 2,
                          margin: "0 2px 2px 0",
                          background: isDone
                            ? "rgba(0, 192, 0, 0.7)"
                            : "rgba(0, 0, 0, 0.2)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          },
          { id, duration: Infinity },
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
