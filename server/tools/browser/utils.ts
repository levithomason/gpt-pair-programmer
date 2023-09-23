import debug from "debug";
import puppeteer, { Browser, ConsoleMessage, Page } from "puppeteer";
import * as htmlToText from "html-to-text";

import { trimStringToTokens } from "../../utils";
import { GPT_4_MAX_TOKENS } from "../../../config";

export const log = debug("gpp:tools:webpage");

const formatConsoleMessage = (msg: ConsoleMessage): string => {
  const { url, lineNumber: line, columnNumber: col } = msg.location();
  const type = msg.type() === "log" ? "" : msg.type().toUpperCase();
  const text = msg.text();

  const message = `${type} ${text} ${url}:${line}:${col}`;

  log("formatConsoleMessage", message);

  return message;
};

//
// State
//

let browser: Browser;
const getBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({ headless: "new" });
  }
  return browser;
};

let page: Page;
const getPage = async () => {
  if (!page) {
    const browser = await getBrowser();
    page = await browser.newPage();
  }
  return page;
};

let $console = "";
(async () => {
  const page = await getPage();

  page.on("console", (msg: ConsoleMessage) => {
    const formattedMessage = formatConsoleMessage(msg);
    log("console", formattedMessage);
    $console += `\n${formattedMessage}`;
    $console.trim();
  });
})();

//
// Functions
//
export const goto = async (url: string) => {
  log("openPage", url);
  clearConsole();
  const page = await getPage();

  await page.goto(url, {
    waitUntil: "networkidle0",
  });
};

export const getDOM = async () => {
  const page = await getPage();

  log("getDOM");
  const domString = await page.evaluate(() => {
    return document.documentElement.outerHTML;
  });

  log("getDOM", domString);

  return trimStringToTokens(domString, GPT_4_MAX_TOKENS);
};

export const readPage = async () => {
  log("readPage");

  const page = await getPage();
  const domString = await page.evaluate(() => {
    return document.body.outerHTML;
  });
  const readableText = htmlToText.convert(domString);

  log("readPage", readableText);

  return trimStringToTokens(readableText, GPT_4_MAX_TOKENS);
};

export const readConsole = () => {
  log("readConsole");

  const trimmed = trimStringToTokens($console, GPT_4_MAX_TOKENS);

  log("readConsole", trimmed);

  return trimmed;
};

export const clearConsole = () => {
  log("clearConsole");
  $console = "";
};
