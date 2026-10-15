
import { Redis } from "ioredis";
import type { Server } from "socket.io";

export function startRedisSubscriber(io: Server): Redis {
  const redisSubscriber = new Redis({
    host: "127.0.0.1",
    port: 6379,
  });

  redisSubscriber.on("error", (error: Error) => {
    console.error("Redis subscriber error:", error.message);
  });

  redisSubscriber.subscribe("in-app-notifications", (error) => {
    if (error) {
      console.error(
        "Failed to subscribe to notification events:",
        error,
      );
      return;
    }

    console.log("Subscribed to in-app notification events.");
  });

  redisSubscriber.on("message", (channel, message) => {
    if (channel !== "in-app-notifications") {
      return;
    }

    try {
      const notification: unknown = JSON.parse(message);

      if (
        typeof notification !== "object" ||
        notification === null ||
        !("recipient" in notification) ||
        !("message" in notification) ||
        typeof notification.recipient !== "string" ||
        typeof notification.message !== "string"
      ) {
        console.error("Received an invalid in-app notification event.");
        return;
      }

      const recipient = notification.recipient.trim().toLowerCase();

      if (!recipient) {
        console.error("Received a notification with an empty recipient.");
        return;
      }

      const room = `recipient:${recipient}`;

      io.to(room).emit("in-app-notification", {
        recipient,
        message: notification.message,
      });

      console.log(`Emitted in-app notification to ${room}.`);
    } catch (error) {
      console.error("Failed to process notification event:", error);
    }
  });

  return redisSubscriber;
}
