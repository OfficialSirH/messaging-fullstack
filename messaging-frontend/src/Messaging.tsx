import React, { useRef, useState } from "react";
import { AuthProvider } from "./AuthContext";

const Messaging: React.FC = () => {
  // const { username, password, isLoggedIn } = useAuthContext();
  // get username, password, and isLoggedIn from localStorage
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const isLoggedIn = Boolean(localStorage.getItem('isLoggedIn'));
  const [messages, setMessages] = useState<string[]>([]);
  const webSocketRef = useRef<WebSocket | null>(null);
  let initializing = useRef<boolean>(true);

  // Function to handle incoming WebSocket messages
  const handleWebSocketMessage = (event: MessageEvent) => {
    const message = event.data;
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  if (initializing.current) {
    initializing.current = false;
  console.log("creating websocket");
  const webSocket = new WebSocket("ws://localhost:8080/ws");
  webSocketRef.current = webSocket;
  webSocket.onmessage = handleWebSocketMessage;
  webSocket.onopen = () =>
    webSocket.send(`/identify ${btoa(`${username}:${password}`)}`);
  }

  // Function to send a message via WebSocket
  const sendMessage = (message: string) => {
    if (webSocketRef.current) {
      setMessages((prevMessages) => [...prevMessages, message]);
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

  // // Initialize the WebSocket connection when the user is logged in
  // useEffect(() => {
  //   console.log('testing this ' + isLoggedIn);
  //   if (isLoggedIn) {
  //     console.log('please, for the love of God');
  //     const webSocket = createWebsocket();

  //     return () => {
  //       // Close the WebSocket connection when the component unmounts
  //       webSocket.close();
  //     };
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isLoggedIn]);

  // log changes of username/password
  // useEffect(() => {
  //   console.log(username, password);
  // }
  // , [username, password]);

  return (
    <AuthProvider>
      <div>
        <h1>Messaging App</h1>
        {isLoggedIn && (
          <div>
            {/* Display the list of messages */}
            <h2>Messages:</h2>
            <ul className="message-container">
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
        )}
      </div>
    </AuthProvider>
  );
};

export default Messaging;
