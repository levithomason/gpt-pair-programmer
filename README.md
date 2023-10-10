<img src="./public/logo-on-light.png" width="128"  alt="GPT Pair Programmer Logo" align="center" />

# Pair Programmer

Let LLMs pair program with you, on your computer.

This project gives LLMs access to [Tools](#tools) (e.g. file system, shell, browser, google, etc.)
on your computer, allowing LLMs to pair program with you just as a colleague would.

This repo is an experiment with many undocumented features. It is not ready for use.

## Tools

Tools (`server/tools`) allow LLMs to interact with your computer.

**Browser**

Launch, interact, control, inspect and debug a browser.

**File**

Read, write, and search files.

**Google**

Run Google searches.

**Project**

Project info, todos, tree, and other helpful information.

**System**

Get information about your system's hardware and software.

**User**

Location, profile, and other information the user shares.

## Architecture

### Local Server

A local server runs the LLMs, executes the [Tools](#tools) locally on your computer, and provides APIs for the web app.
The local server powers the web app and the ChatGPT plugin, so it's always required.

### Web App

The web app is the primary interface.
It provides a chat UI similar to ChatGPT, but with additional features.

### ChatGPT Plugin

Give GPT access to your computer via the ChatGPT plugin.
This is the easiest way to get started, but is limited in functionality.

This allows ChatGPT to run the same [Tools](#tools) on your computer as the web app.

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
An IDE tool specialized for GPT to use to understand the working context (tree, tabs, current file, etc.). Improve file editing capabilities (LLMs currently uses the command line). See `.archived/research/file-editing`.

**Approvals**  
A workflow for approving GPT responses.

### Other Considerations

**Chrome Extension**  
Give LLMs access to your browser via a Chrome extension. See what you see, read console, access devtools, etc.

**IDE Extension**  
Give LLMs insights about your IDE session. See what you see, open file contents, clipboard, location history, current edit history, etc.

**Cloud**  
A cloud-based version of the application, for those who don't want to install anything. This would be a hosted version of the desktop app, served as a web app.
