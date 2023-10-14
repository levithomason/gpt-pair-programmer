import { PromptTemplate } from "langchain/prompts";

import {
  codellamaLLM,
  llama2LLM,
  mistralLLM,
  mistralTextLLM,
} from "./ollama.js";
import { openAILLM } from "./openai.js";

import { ChatMessage } from "../../models/index.js";
import { getDB, setupDB } from "../../database/index.js";

const db = await getDB();
await setupDB(db);

const chatMessages = await ChatMessage.findAll();
chatMessages.shift(); // remove system message

const formatMessage = (message: ChatMessage) => {
  const { role, content, name, functionCall, createdAt } = message;

  let persona = "";
  let action = "";

  switch (role) {
    case "user":
      persona = "User";
      action = functionCall?.name ? `called function` : "said";
      break;
    case "assistant":
      persona = "You";
      action = functionCall?.name ? `called function` : "said";
      break;
    case "system":
      persona = "System";
      action = "said";
      break;
    case "function":
      persona = `Function ${name}`;
      action = "returned";
      break;
    default:
      throw new Error(`Unknown role: ${role}`);
  }

  return `${persona} ${action}:\n${content}`;
};

const promptUpdateUnderstanding =
  PromptTemplate.fromTemplate(`You're a memory function that strictly provides shorthand factual outpu. Rewrite your memory below to incorporate the new message below.

[MEMORY]
{context}

[MESSAGE]
{newMessage}`);

const promptJournal =
  PromptTemplate.fromTemplate(`You're a precise, matter-of-fact, AI tool. Provide a journal entry of this message to save in your long-term memory:
{newMessage}
`);

const promptSnowballSummary =
  PromptTemplate.fromTemplate(`You're a concise and matter-of-fact AI function. Provide an updated memory to save in your long-term memory.

PREVIOUS MEMORY:

{context}

NEW MESSAGE:

{newMessage}
`);

const promptLowResolutionMemory =
  PromptTemplate.fromTemplate(`Provide a low-resolution first-person memory of the message. You must ONLY reply with the new memory.

[BEGIN MESSAGE]
{newMessage}
[END MESSAGE]`);

const promptShorthandNote =
  PromptTemplate.fromTemplate(`Provide low-resolution first-person shorthand notes of the message for later reference. You must ONLY reply with the note.

[BEGIN MESSAGE]
{newMessage}
[END MESSAGE]`);

const promptInnerMonologue =
  PromptTemplate.fromTemplate(`Provide you first-person inner monologue as a result of the message below. You must ONLY reply with the inner monologue.

[BEGIN MESSAGE]
{newMessage}
[END MESSAGE]`);

const promptRunningMentalModel =
  PromptTemplate.fromTemplate(`Below is your dynamic running mental model of a conversation. Update your mental model based on the new message. ONLY respond with the updated mental model.

MENTAL MODEL
------------
{context}

NEW MESSAGE
-----------
{newMessage}
`);

const promptCondenseMemory =
  PromptTemplate.fromTemplate(`Below is a chat message to you. Condense it as a memory.
  ###
{newMessage}
`);

const prompt = ("" ||
  // promptUpdateUnderstanding ||
  // promptJournal ||
  // promptSnowballSummary ||
  // promptLowResolutionMemory ||
  // promptShorthandNote || // so far the best
  // promptInnerMonologue ||
  // promptRunningMentalModel ||
  promptCondenseMemory ||
  "") as PromptTemplate;

const model =
  mistralLLM ||
  //
  mistralTextLLM ||
  //
  llama2LLM ||
  //
  codellamaLLM ||
  //
  openAILLM;

const chain = prompt.pipe(model);

const context = [];

for (let i = 0; i < chatMessages.length; i++) {
  const newMessage = formatMessage(chatMessages[i]);

  console.log();
  console.log("-".repeat(60));
  console.log(`[Message ${i + 1}]`);
  console.log();
  console.log("MESSAGE =>", newMessage);
  console.log();
  console.log("CONTEXT =>", context);

  context.push(await chain.invoke({ context, newMessage }));
}

console.log("-".repeat(60));
console.log();
console.log("FINAL CONTEXT =>", context);
