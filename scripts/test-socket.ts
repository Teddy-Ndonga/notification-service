import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to Socket.IO server.");
  console.log("Socket ID:", socket.id);

  socket.disconnect();
});

socket.on("connect_error", (error) => {
  console.error("Socket connection failed:", error.message);
  process.exitCode = 1;
});
