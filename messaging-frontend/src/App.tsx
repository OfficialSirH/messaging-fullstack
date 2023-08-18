import React, { useEffect, useRef, useState } from "react";
import LoginForm from "./components/LoginForm";
import RegistrationForm from "./components/RegistrationForm";
import { AuthProvider, useAuthContext } from "./AuthContext";

const App: React.FC = () => {
  const { username, password, isLoggedIn } = useAuthContext();
  const [messages, setMessages] = useState<string[]>([]);
  const webSocketRef = useRef<WebSocket | null>(null);

  // Function to handle incoming WebSocket messages
  const handleWebSocketMessage = (event: MessageEvent) => {
    const message = event.data;
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Function to send a message via WebSocket
  const sendMessage = (message: string) => {
    if (webSocketRef.current?.OPEN) {
      webSocketRef.current.send(message);
    }
  };

  // const createWebsocket = () => {
  //   console.log('creating websocket');
  //   const webSocket = new WebSocket("ws://localhost:8080/ws");
  //   webSocketRef.current = webSocket;
  //   webSocket.onmessage = handleWebSocketMessage;
  //   webSocket.send(`/identify ${Buffer.from(`${username}:${password}`).toString("base64")}`);
  //   return webSocket;
  // }

  // Initialize the WebSocket connection when the user is logged in
  // useEffect(() => {
  //   console.log("testing this " + isLoggedIn);
  //   if (isLoggedIn) {
  //     console.log("please, for the love of God");
  //     console.log("creating websocket");
  //     const webSocket = new WebSocket("ws://localhost:8080/ws");
  //     webSocketRef.current = webSocket;
  //     webSocket.onmessage = handleWebSocketMessage;
  //     webSocket.onopen = () =>
  //       webSocket.send(`/identify ${btoa(`${username}:${password}`)}`);

  //     return () => {
  //       // Close the WebSocket connection when the component unmounts
  //       webSocket.close();
  //     };
  //   }
  // }, [isLoggedIn, username, password]);

  return (
    <AuthProvider>
      <div>
        <h1>Messaging App</h1>
        {isLoggedIn ? (
          <div>
            {/* Display the list of messages */}
            <h2>Messages:</h2>
            <ul>
              {messages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
            {/* Form to send a message */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const message = new FormData(e.target as HTMLFormElement).get(
                  "message"
                ) as string;
                sendMessage(message);
                // reset the form
                (e.target as HTMLFormElement).reset();
              }}
            >
              <input
                type="text"
                name="message"
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        ) : (
          <div className="form-wrapper">
            <LoginForm />
            <RegistrationForm />
          </div>
        )}
      </div>
    </AuthProvider>
  );
};

export default App;
