import { Ollama } from "langchain/llms/ollama";

const model = [
  //
  "mistral",
  "codellama:7b",
  "llama2",
][0];

export const ollamaLLM = new Ollama({
  baseUrl: "http://localhost:11434",
  model,
  temperature: 0.5,
});
