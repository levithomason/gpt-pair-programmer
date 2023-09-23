import debug from "debug";
import puppeteer, { Browser, ConsoleMessage, Page } from "puppeteer";
import * as htmlToText from "html-to-text";

import { trimStringToTokens } from "../../utils";
import { GPT_4_MAX_TOKENS } from "../../config";

export const log = debug("gpp:tools:webpage");

let browser: Browser;
let page: Page;
let consoleMessages: string = "";

const getBrowser = async (): Promise<Browser> => {
  if (browser) {
    return browser;
  }

  browser = await puppeteer.launch({ headless: "new" });

  return browser;
};

const formatConsoleMessage = (msg: ConsoleMessage): string => {
  const { url, lineNumber: line, columnNumber: col } = msg.location();
  const type = msg.type() === "log" ? "" : msg.type().toUpperCase();
  const text = msg.text();

  const message = `${type} ${text} ${url}:${line}:${col}`;

  log("formatConsoleMessage", message);

  return message;
};

export const openPage = async (url: string) => {
  log("openPage", url);
  clearConsole();

  const browser = await getBrowser();
  page = await browser.newPage();

  page.on("console", (msg: ConsoleMessage) => {
    consoleMessages += `\n${formatConsoleMessage(msg)}`;
    consoleMessages.trim();
  });

  await page.goto(url);
};

export const closeBrowser = async () => {
  log("closePage");
  await browser.close();
};

export const getDOM = async () => {
  if (!page) {
    throw new Error("Page is not open.");
  }

  log("getDOM");
  const domString = await page.evaluate(() => {
    return document.documentElement.outerHTML;
  });

  log("getDOM", domString);

  return trimStringToTokens(domString, GPT_4_MAX_TOKENS);
};

export const readPage = async () => {
  if (!page) {
    throw new Error("Page is not open.");
  }

  log("readPage");
  const domString = await page.evaluate(() => {
    return document.body.outerHTML;
  });

  const readableText = htmlToText.convert(domString);

  log("readPage", readableText);

  return trimStringToTokens(readableText, GPT_4_MAX_TOKENS);
};

export const readConsole = () => {
  const trimmedConsoleMessages = trimStringToTokens(
    consoleMessages,
    GPT_4_MAX_TOKENS,
  );

  log("readConsole", trimStringToTokens);

  return trimmedConsoleMessages;
};

export const clearConsole = () => {
  log("clearConsole");
  consoleMessages = "";
};
