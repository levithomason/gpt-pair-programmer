import debug from "debug";
import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes } from "sequelize";
import type { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import { AfterCreate, Column, Model, Table } from "sequelize-typescript";

import { getSocketIO } from "../socket.io-server.js";

export type ChatMessageAttributes = InferAttributes<ChatMessage>;
export type ChatMessageCreationAttributes =
  InferCreationAttributes<ChatMessage>;

const log = debug("gpp:server:models:chat-message");

@Table({})
export class ChatMessage extends Model<
  ChatMessageAttributes,
  ChatMessageCreationAttributes
> {
  @AfterCreate
  static emitNewChatMessage(instance: ChatMessage) {
    const json = instance.toJSON();

    log("afterCreate", json);

    const io = getSocketIO();
    io.emit("chatMessageCreate", { message: json });
  }

  @Column({ type: DataTypes.STRING, allowNull: false })
  project: string;

  @Column({ type: DataTypes.ENUM("system", "user", "assistant", "function") })
  role: ChatCompletionMessageParam["role"];

  /**
   * The content of the message, or return value of the function.
   */
  @Column({ type: DataTypes.TEXT })
  content: ChatCompletionMessageParam["content"];

  /**
   * Name of the author (or function) which generated the content.
   */
  @Column({ type: DataTypes.STRING })
  name?: ChatCompletionMessageParam["name"];

  /**
   * If defined, this message will be replaced with a function call.
   */
  @Column({ type: DataTypes.JSON })
  functionCall?: {
    name: ChatCompletionMessageParam["function_call"]["name"];
    arguments: ChatCompletionMessageParam["function_call"]["arguments"];
  };
}
