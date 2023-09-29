# ChatGPT Browser Extension

## Overview

The ChatGPT browser extension acts as a bridge between the user's browser and the local server, allowing ChatGPT to interact directly with web content in the user's browser. This extension enhances the developer tools experience by providing a custom DevTools panel.

## Features

- Custom DevTools panel for ChatGPT interactions.
- Content script to interact with web pages.
- Background script to manage extension behavior and communicate with the local server.

## Use-Case Flow

To interact with the developer tools (DevTools) in your browser, the extension uses the DevTools API provided by browsers. This API allows extensions to extend, access, and manipulate the functionality of the developer tools.

1. **User Interaction:** 
   - The user interacts with a web page in their browser.
   - The content script detects this interaction or any changes in the web content that need to be relayed to ChatGPT.

2. **Content Script to Background Script Communication:** 
   - The content script sends messages to the background script using the WebExtensions `runtime.sendMessage` API.
   - The background script listens for these messages using the `runtime.onMessage` API.

3. **Background Script to Local Server Communication:** 
   - Upon receiving a message from the content script, the background script communicates with the local server using standard HTTP requests.
   - The local server processes the request and communicates with ChatGPT to get a response.

4. **Response Handling:** 
   - The local server sends the response back to the background script.
   - The background script then relays this response to the content script, which can take appropriate actions on the web page (e.g., modifying the DOM).

This flow ensures a seamless interaction between the user's browser, the browser extension, the local server, and ChatGPT, allowing for real-time interaction and debugging capabilities.

## Installation

1. Clone or download the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable `Developer mode`.
4. Click on `Load unpacked` and select the `browser-extension` directory.
5. The ChatGPT extension should now be installed and active.

## Usage

1. Open a web page in Chrome.
2. Launch the developer tools (F12 or Ctrl+Shift+I).
3. Navigate to the `ChatGPT` panel within the DevTools.
4. Interact with the panel to communicate with ChatGPT and inspect web content.

## Development

The extension consists of the following main components:

- `manifest.json`: Contains metadata about the extension, such as its name, version, permissions, and scripts.
- `content.js`: A content script that interacts with web pages.
- `background.js`: A background script that manages the extension's behavior.
- `devtools.html` & `devtools.js`: Define the custom DevTools panel and its behavior.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) to get started.