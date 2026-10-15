import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to Socket.IO server.");
  console.log("Socket ID:", socket.id);

  socket.emit("join-recipient", "teddy@example.com");
});

socket.on("joined-recipient", (data) => {
  console.log("Room join successful:", data);
  console.log("Waiting for an in-app notification...");
});

socket.on("in-app-notification", (notification) => {
  console.log("Received real-time notification!");
  console.log(notification);

  socket.disconnect();
  process.exitCode = 0;
});

socket.on("socket-error", (error) => {
  console.error("Socket error:", error);
});

socket.on("connect_error", (error) => {
  console.error("Connection failed:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});
