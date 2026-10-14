import { Queue } from "bullmq";
import { NotificationPayload } from "../types/notification.js";

export const notificationQueue = new Queue<NotificationPayload>(
  "notifications",
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);
