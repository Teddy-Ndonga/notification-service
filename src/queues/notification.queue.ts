import { Queue } from "bullmq";

export const notificationQueue = new Queue("notifications", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});
