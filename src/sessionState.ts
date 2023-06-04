import fs from "fs";
import path from "path";

type SessionState = {
  file: { path: string; content: string };
};

const SESSION_STATE_FILENAME = "SESSION_STATE.json";
const SESSION_STATE_PATH = path.resolve(__dirname, SESSION_STATE_FILENAME);

// Load the session state from the JSON file
const data = fs.readFileSync(SESSION_STATE_PATH, "utf-8");
let sessionState: SessionState = JSON.parse(data);

export const getSessionState = () => JSON.parse(JSON.stringify(sessionState));

export const setSessionState = (partialState: Partial<SessionState>) => {
  sessionState = { ...sessionState, ...partialState };
  fs.writeFileSync(SESSION_STATE_PATH, JSON.stringify(sessionState, null, 2));
};
