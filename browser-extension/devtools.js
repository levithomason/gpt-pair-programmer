// DevTools script for ChatGPT Browser Extension

console.log('ChatGPT DevTools script loaded.');

// Establish a connection to the background script
var port = chrome.runtime.connect({name: 'devtools'});

// Placeholder event listener for element selection
// In the future, this can be expanded to fetch computed styles or other information
chrome.devtools.panels.elements.onSelectionChanged.addListener(function() {
  console.log('Element selected in DevTools.');
  port.postMessage({action: 'elementSelected'});
});

chrome.devtools.panels.create(
  "ChatGPT",                 // Title of the panel
  "chatgpt-icon.png",                // Path to an icon (optional)
  "devtools.html",           // Path to the HTML page for the panel
  function(panel) {
    // Optional callback when the panel is created
    console.log("ChatGPT panel created");
  }
);
