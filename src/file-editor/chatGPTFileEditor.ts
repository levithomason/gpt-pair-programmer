import * as fs from "fs";
import path from "path";

export class ChatGPTFileEditor {
  filePath: string = "";

  lines: string[] = [];
  windowSize: number = 20;
  windowStart: number = 0;

  get windowBottom() {
    return this.windowStart + this.windowSize;
  }

  get fileLineCount() {
    return this.lines.length;
  }

  get linesAboveWindow() {
    return this.windowStart;
  }

  get linesBelowWindow() {
    return this.lines.length - this.windowBottom;
  }

  open(filePath: string) {
    this.filePath = filePath;
    this.lines = fs.readFileSync(this.filePath, "utf-8").split("\n");
    this.windowStart = 0;
    this.saveState();
  }

  getWindow(): string {
    // const isEOF = this.windowBottom >= this.lines.length;
    //
    // const windowWithGUI = [
    //   "=".repeat(80),
    //   `GPT FILE EDITOR: ${this.filePath}`,
    //   ...this.lines
    //     .slice(this.windowStart, this.windowStart + this.windowSize)
    //     .map((line, i, arr) => {
    //       const gutter = String(this.windowStart + arr.length).length;
    //       return `${String(this.windowStart + i + 1).padEnd(gutter)}  ${line}`;
    //     }),
    //   isEOF
    //     ? "EOF"
    //     : "... " +
    //       this.linesBelowWindow +
    //       " more line" +
    //       (this.linesBelowWindow > 1 ? "s" : ""),
    //   "=".repeat(80),
    // ];

    const window = this.lines.slice(
      this.windowStart,
      this.windowStart + this.windowSize
    );

    console.log(window.join("\n"));

    return window.join("\n");
  }

  increaseWindowSize(lines = 1) {
    this.windowSize = Math.min(this.lines.length, this.windowSize + lines);
    this.saveState();
  }

  decreaseWindowSize(lines = 1) {
    this.windowSize = Math.min(this.lines.length, this.windowSize - lines);
    this.saveState();
  }

  scrollUp(lines = 1) {
    this.windowStart = Math.max(0, this.windowStart - lines);
    this.saveState();
  }

  scrollDown(lines = 1) {
    this.windowStart = Math.min(
      this.lines.length - this.windowSize,
      this.windowStart + lines
    );
    this.saveState();
  }

  scrollToTop() {
    this.windowStart = 0;
    this.saveState();
  }

  scrollToBottom() {
    this.windowStart = this.lines.length - this.windowSize;
    this.saveState();
  }

  pageUp() {
    this.scrollUp(this.windowSize);
    this.saveState();
  }

  pageDown() {
    this.scrollDown(this.windowSize);
    this.saveState();
  }

  /**
   * Find a pattern in the current window and jump to the line where the result is.
   */
  find(searchString: string): boolean {
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].includes(searchString)) {
        this.windowStart = i;
        this.saveState();
        return true;
      }
    }
    return false;
  }

  /**
   * Replace the contents of the current window with a new string.
   */
  replaceWindow(newContent: string) {
    const newLines = newContent.split("\n");
    this.lines.splice(this.windowStart, this.windowSize, ...newLines);
    this.saveState();
  }

  save() {
    fs.writeFileSync(this.filePath, this.lines.join("\n"), "utf-8");
  }

  private get stateFileName() {
    return path.resolve(__dirname, "file-editor-state.json");
  }

  // Save the state to a JSON file
  private saveState() {
    console.log("saveState");
    const state = {
      filePath: this.filePath,
      windowSize: this.windowSize,
      windowStart: this.windowStart,
      content: this.lines.join("\n"),
    };

    if (!fs.existsSync(this.stateFileName)) {
      fs.writeFileSync(this.stateFileName, "{}", "utf-8");
    }

    fs.writeFileSync(
      this.stateFileName,
      JSON.stringify(state, null, 2),
      "utf-8"
    );
  }

  // Load the state to a JSON file
  loadState() {
    console.log("loadState");
    const state = JSON.parse(fs.readFileSync(this.stateFileName, "utf-8"));
    this.filePath = state.filePath;
    this.windowSize = state.windowSize;
    this.windowStart = state.windowStart;
    this.lines = state.content.split("\n");
  }
}

// const editor = new ChatGPTFileEditor();
// editor.open("gpt-home/Popup.d.ts");
// console.log(editor.stateFileName);
//
// console.log(editor.getWindow());
// editor.scrollDown();
