import { Database } from "sqlite3";

export type ChatRole = "user" | "gpt";

export interface Chat {
  id: number;
  openaiId: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export const createChatTable = (db: Database) => {
  db.run(
    "CREATE TABLE IF NOT EXISTS chat (id INTEGER PRIMARY KEY AUTOINCREMENT, openaiId TEXT, role TEXT, content TEXT, timestamp INTEGER)",
  );
};

export const insertChat = (db: Database, chat: Chat) => {
  db.run(
    "INSERT INTO chat (id, openaiId, role, content, timestamp) VALUES (?, ?, ?, ?, ?)",
    [chat.id, chat.openaiId, chat.role, chat.content, chat.timestamp],
  );
};

export const getChats = (db: Database) => {
  return new Promise<Chat[]>((resolve, reject) => {
    db.all("SELECT * FROM chat", (error, rows: Chat[]) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
};
