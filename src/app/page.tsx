"use client";

import io from "socket.io-client";
import { useState, useEffect } from "react";

const socket = io("http://localhost:3001");

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [clicks, setClicks] = useState<number>(0);
  const [newMessage, setNewMessage] = useState("");
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(50);

  useEffect(() => {
    // Listen for incoming messages
    const handleNewMessage = (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleMouseMovement = (x: number, y: number) => {
      console.log("handling", x, y);
      setXPos(x);
      setYPos(y);
    };

    const handleNewClick = (click: number) => {
      setClicks((prevClicks) => prevClicks + click);
    };

    socket.on("chat message", handleNewMessage);
    socket.on("click added", handleNewClick);
    socket.on("mousePos", (x: number, y: number) => handleMouseMovement(x, y));

    // Clean up the event listener when the component unmounts
    return () => {
      socket.off("chat message", handleNewMessage);
      socket.off("click added", handleNewClick);
      socket.off("mousePos", handleMouseMovement);
    };
  }, []);

  const sendMessage = () => {
    socket.emit("chat message", newMessage);
    setNewMessage("");
  };

  const sendClick = () => {
    socket.emit("click added", 1);
  };

  const sendMousePos = (e: React.MouseEvent) => {
    console.log(e.clientX, e.clientX, "test");
    socket.emit("mousePos", e.clientX, e.clientY);
  };

  return (
    <main
      onMouseMove={sendMousePos}
      className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white"
    >
      <div
        className={`absolute h-4 w-4 rounded-full bg-white left-[${xPos}px] top-[${yPos}px]`}
      ></div>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Websockets
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <div>
            {messages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
          <input
            type="text"
            className="text-black"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>

          <button onClick={sendClick} className="rounded-lg bg-sky-700 p-4">
            Waiting for {4 - clicks} clicks
          </button>
          {clicks <= 3 ? (
            <p>There are currently {clicks} clicks</p>
          ) : (
            <p>All clicked, team wins!</p>
          )}
        </div>
      </div>
    </main>
  );
}
