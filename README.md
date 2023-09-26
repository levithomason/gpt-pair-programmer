<img src="./public/logo-on-light.png" width="128"  alt="GPT Pair Programmer Logo" align="center" />

# Pair Programmer

Let GPT-4 pair program with you, on your computer.

This project gives GPT-4 access to (Tools)[#tools] (e.g. shell, browser, google, etc.)
on your computer, allowing GPT-4 to pair program with you just as a colleague would.

This repo is an experiment with many undocumented features. It is not ready for use.

## Tools

Tools allow GPT-4 to interact with your computer.

**Browser**

- `browserGoTo` - Go to a url
- `getBrowserDOM` - Read the browser's DOM
- `getBrowserConsole` - Read console logs
- `clearBrowserConsole` - Clear console logs
- `readBrowser` - Read browser page
- `browserExecute` - Execute a Puppeteer command

**Google**

- `googleSearch` - Perform a Google search

**System**

- `execSystemCommand` - Execute a system command
- `getSystemInfo` - Retrieve System Information
- `getSystemLocation` - Retrieve physical location information of the user's device
- `getSystemTree` - Get the system tree

## Interfaces

### Desktop

The primary interface is the desktop app, which provides the most powerful experience.
This requires adding API keys for OpenAI and Google.
This is the most powerful interface, but requires the most setup.

A chat interface is provided, similar to ChatGPT, but with additional features.

### ChatGPT Plugin

Give GPT access to your computer via the ChatGPT plugin.
This is the easiest way to get started, but is limited in functionality.

Gives ChatGPT access to the (Tools)[#tools] listed above.

## Roadmap

**Cost Tracking**  
Track and display the cost of conversations.

**Memory**  
Persistent memory features for GPT. `/mind/memory` could allow GPT to journal memories (POST) of relevant events and information. GPT could then first see if it "remembers" (GET) anything about various topics before responding, creating plans, or taking action. 

**Cognition**  
Beyond simple Q&A, enabling more complex problem-solving.
Planning - see `.archived/research/reasoning.md`.

**Projects**  
Point the application to a directory on your computer to start a pair programming session. The directory will be indexed for quick search, retrieval, and reasoning by GPT.

**IDE Tool**  
An IDE tool specialized for GPT to use to understand the working context (tree, tabs, current file, etc.). Improve file editing capabilities (GPT-4 currently uses the command line). See `.archived/research/file-editing`.

**Approvals**  
A workflow for approving GPT responses.

### Other Considerations

**Chrome Extension**  
Give GPT-4 access to your browser via a Chrome extension. See what you see, read console, access devtools, etc.

**IDE Extension**  
Give GPT-4 insights about your IDE session. See what you see, open file contents, clipboard, location history, current edit history, etc.

**Cloud**  
A cloud-based version of the application, for those who don't want to install anything. This would be a hosted version of the desktop app, served as a web app.
