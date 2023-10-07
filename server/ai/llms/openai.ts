import { OpenAI } from "langchain/llms/openai";
import { BaseError } from "../../utils/index.js";

// TODO: add an env solution to handle env vars and validation
const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  throw new BaseError("Missing OPENAI_API_KEY environment variable.");
}

export const openAILLM = new OpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  azureOpenAIApiKey: null,
});
