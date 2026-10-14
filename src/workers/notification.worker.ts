import { Worker } from "bullmq";
import { NotificationPayload } from "../types/notification.js";

const worker = new Worker<NotificationPayload>(
  "notifications",
  async (job) => {
    console.log(`Processing job ${job.id}`);
    console.log("Attempt:", job.attemptsMade + 1);
    console.log("Notification:", job.data);

    if (job.data.message.includes("[FAIL]")) {
      throw new Error("Simulated notification delivery failure");
    }

    console.log("Notification processed successfully.");
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});
