import debug from "debug";
import type { Browser, ConsoleMessage, Page } from "puppeteer";
import puppeteer from "puppeteer";
import * as htmlToText from "html-to-text";

export const log = debug("gpp:tools:browser:utils");

export const formatConsoleMessage = (msg: ConsoleMessage): string => {
  const { url, lineNumber: line, columnNumber: col } = msg.location();
  const type = msg.type() === "log" ? "" : msg.type().toUpperCase();
  const text = msg.text();

  return `${type} ${text} ${url}:${line}:${col}`;
};

//
// State
//

let browser: Browser;
export const getBrowser = async () => {
  if (!browser) {
    // TODO: every server restart is causing orphaned chromium processes
    // browser = await puppeteer.launch({
    //   headless: "new",
    // });
  }
  return browser;
};

let page: Page;
let $console: ConsoleMessage[] = [];
export const getPage = async () => {
  if (!page || page.isClosed()) {
    const browser = await getBrowser();
    page = await browser.newPage();

    page.on("console", (msg: ConsoleMessage) => {
      $console.push(msg);
    });
  }

  return page;
};

//
// Functions
//
export const goTo = async (url: string): Promise<string> => {
  const page = await getPage();

  clearConsole();

  const httpResponse = await page.goto(url, { waitUntil: "networkidle2" });

  return `Navigation completed with status: ${httpResponse.status()}`;
};

export const getDom = async () => {
  const page = await getPage();

  return await page.evaluate(() => document.documentElement.outerHTML);
};

export const readPage = async () => {
  const page = await getPage();
  const domString = await page.evaluate(() => document.body.outerHTML);

  return htmlToText.convert(domString);
};

export const getConsole = () => [...$console];

export const readConsole = () => {
  return $console.map(formatConsoleMessage).join("\n");
};

export const clearConsole = () => {
  $console = [];
};

export const click = async (selector: string) => {
  const page = await getPage();
  await page.click(selector);
  return "Clicked successfully";
};

export const type = async (selector: string, value: string) => {
  const page = await getPage();
  await page.type(selector, value);

  return "Typed successfully";
};

export const evaluate = async (value: string): Promise<any> => {
  const page = await getPage();
  return await page.evaluate(value);
};
