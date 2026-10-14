import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to Socket.IO server.");
  console.log("Socket ID:", socket.id);

  socket.emit("join-recipient", "teddy@example.com");
});

socket.on("joined-recipient", (data) => {
  console.log("Room join successful:", data);
  socket.disconnect();
});

socket.on("socket-error", (data) => {
  console.error("Socket error:", data);
  socket.disconnect();
  process.exitCode = 1;
});

socket.on("connect_error", (error) => {
  console.error("Socket connection failed:", error.message);
  process.exitCode = 1;
  socket.disconnect();
});
