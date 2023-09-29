// Background script for ChatGPT Browser Extension

console.log('ChatGPT background script loaded.');

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name === 'devtools');
  port.onMessage.addListener(function(msg) {
    console.log('Received message from devtools:', msg);
  });
});