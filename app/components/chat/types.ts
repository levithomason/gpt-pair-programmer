export type MessageRole = "user" | "assistant";

export type Message = {
  role: MessageRole;
  content: string;
  timestamp: number;
};
