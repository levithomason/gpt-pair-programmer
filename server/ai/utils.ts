import { OpenAI } from "openai";
import debug from "debug";

import { BaseError } from "../utils/index.js";

const log = debug("gpp:server:ai:utils");

// TODO: add an env solution to handle env vars and validation
const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  throw new BaseError("Missing OPENAI_API_KEY environment variable.");
}

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
