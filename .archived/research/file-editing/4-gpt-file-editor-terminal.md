## ChatGPT - File Editor Terminal

Full chat log:
https://chat.openai.com/share/f85f4197-0ab7-4117-a33f-2223ef52a13c

Endpoints were created to /nano/open a file and /nano/keys to send keystrokes to the nano editor. Special handling was given to modifier keys and arrow keys.

PROMPT:

    I have a challenge for you! I am running a local server with endpoints for opening nano and sending keys.
    
    You can open a file like this:
    ```
    curl -X POST http://localhost:3000/nano/open -H "Content-Type: application/json"  -d '{ "fileName": "test.txt" }'
    ```
    
    You can send keystrokes to nano like this:
    ```
    curl -X POST http://localhost:3000/nano/keys -H "Content-Type: application/json" -d '{"keys": [{ "key": "e", "meta": true }, { "key": " " }, { "key": "N" }, { "key": "i" }, { "key": "c" }, { "key": "e" }, { "key": " " }, { "key": "t" }, { "key": "o" }, { "key": " " }, { "key": "m" }, { "key": "e" }, { "key": "e" }, { "key": "t" }, { "key": " " }, { "key": "y" }, { "key": "o" }, { "key": "u" }, { "key": "." }, { "key": "x", "meta": true }, { "key": "y" }, { "key": "\n" } ]}'
    ```
    
    The key interface is:
    ```typescript
    interface Key {
      key: string;
      arrow?: "up" | "down" | "right" | "left";
      ctrl?: boolean;
      alt?: boolean;
      shift?: boolean;
      meta?: boolean;
    }
    ```
    
    The terminal output will be provided in response, like this:
    
    There is a file in the current directory called Popup.d.ts. I want you to provide me a list of keystrokes I can type into the terminal to accomplish a goal.
    
    Goal: Add an `open` prop to the `Popup.d.ts` file.
    
    Rule: Follow the practices shown in the file and known best practices based on the syntax you see.
    
    Workflow Loop: You are only allowed to provide me a list of keys to press in the terminal. I will press the keys and reply with the terminal's output. We will operate in this loop until you are done.

DEBUG REQUESTS:

-- OPEN ---------------------------------------------
curl -X POST http://localhost:3000/nano/open \
-H "Content-Type: application/json" \
-d '{ "fileName": "gpt-home/Popup.d.ts" }'

curl -X POST http://localhost:3000/nano/open \
-H "Content-Type: application/json" \
-d '{ "fileName": "test.txt" }'

-- Where is -----------------------------------------
curl -X POST http://localhost:3000/nano/keys \
-H "Content-Type: application/json" \
-d '{"keys": [{ "key": "w", "meta": true }]}'

-- Exit -----------------------------------------
curl -X POST http://localhost:3000/nano/keys \
-H "Content-Type: application/json" \
-d '{"keys": [{ "key": "x", "meta": true }, { "key": "y" }, { "key": "\n" }]}'
