import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  socket.on("join-recipient", (recipient: unknown) => {
    if (typeof recipient !== "string" || recipient.trim() === "") {
      socket.emit("socket-error", {
        error: "A valid recipient is required.",
      });
      return;
    }

    const normalizedRecipient = recipient.trim().toLowerCase();
    const room = `recipient:${normalizedRecipient}`;

    socket.join(room);

    console.log(`Socket ${socket.id} joined room: ${room}`);

    socket.emit("joined-recipient", {
      recipient: normalizedRecipient,
      message: "Successfully joined recipient room.",
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

const PORT = Number(process.env.PORT) || 3000;

httpServer.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
