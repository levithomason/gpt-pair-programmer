import { Ollama } from "langchain/llms/ollama";

// TODO: These rely on Ollama being installed and running locally.
//       There should be some validation to ensure that's the case.

export const mistralLLM = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "mistral",
  temperature: 1,
});

export const mistralInstructLLM = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "mistral:7b-instruct",
  temperature: 1,
});

export const codellamaLLM = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "codellama",
  temperature: 1,
});

export const llama2LLM = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "llama2",
  temperature: 1,
});
