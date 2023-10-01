export type MessageRole = "system" | "user" | "assistant" | "function";

export type ChatMessageType = {
  role: MessageRole;
  name?: string;
  content: string;
  functionCall?: {
    name: string;
    arguments: string[];
  };
};
