
import { Redis } from "ioredis";

export const redisPublisher = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

redisPublisher.on("error", (error: Error) => {
  console.error("Redis publisher error:", error.message);
});
