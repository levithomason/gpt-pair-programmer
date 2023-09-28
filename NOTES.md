# Notes

Freeform notes about the project as they come to mind.

## Ideas

### First-nail

- Document a project

- Work on itself

- Solve a github issue

### Project

Should include name, purpose, goals, etc. which capture the intent of the project. Any other info needed to form a vision for the project's future and guide decision-making should be included. Decisions are not based on the tech or the current state, they are based on the project's purpose and goals.

### Context

#### Mind/Memories

On topic/context switch, query memories and feed these to GPT.

Have a flow where GPT saves summarized memories at appropriate times. Documents in a vector store or similar. This could be a tool where GPT decides when and what to remember, or hard-coded into the chat pipeline where each message has an opportunity to be saved. A lightweight/cheap/fast LLM classifier could decide if this should be remembered.

### Picking up where you left off

Building context, "ramping up"

### Terminal Tool

**long-running**
Current tool is ephemeral.
Could add /terminal/open|close type behavior to allow for long-running tasks.
Capture output and allow 

Have a POST/GET for "/terminal" to run/read commands. Capture input/output, show GPT's terminal in the UI. 

**history**
Can we derive useful info from reading shell history files? Shows what CLIs have been used recently.

**user's terminal**  
It would be helpful if the user's terminal were viewable by GPT. In one case, I have a server log error which if seen by GPT it could have debugged. Perhaps this could be a server log thing instead...

### UI & GPTs "IDE"

GPT interacts with tools (terminal, browser, etc.).
The GUI could show the user what GPT "sees" by showing the tools GPT has open and what data is displayed in them.

Each tool could be shown as a "tab" in the UI. The contents of the tab being the tool's return data. Example:

```
Terminal  |  Browser |  File
-----------------------------
$ ls     |  Google  |  index.html
$ cd ..  |  Google  |  README.md
$ ls     |  Google  |  NOTES.md
```



```