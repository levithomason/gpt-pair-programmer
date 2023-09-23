import * as React from "react";
import axios from "axios";

export const ChatInterface = () => {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState<string>("");

  const handleSend = async () => {
    setMessages([...messages, "Loading..."]);
    try {
      const response = await axios.post(
        `http://0.0.0.0:5004/chat`,
        {
          prompt: message,
        },
        {
          responseType: "stream",
        },
      );

      let newMessage = "";
      response.data.on("data", (chunk: any) => {
        const parsedChunk = JSON.parse(chunk.toString());
        if (parsedChunk.choices) {
          newMessage += parsedChunk.choices[0].text;
        }
      });

      response.data.on("end", () => {
        setMessages([...messages, newMessage]);
      });
    } catch (err) {
      console.log(err);
      setMessages([...messages, "I'm sorry, there was an error."]);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
    </div>
  );
};
