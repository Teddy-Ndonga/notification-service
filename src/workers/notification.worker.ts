import { Worker } from "bullmq";
import { NotificationPayload } from "../types/notification.js";
import { sendEmail } from "../services/email.service.js";
import { sendInAppNotification } from "../services/in-app.service.js";

const worker = new Worker<NotificationPayload>(
  "notifications",
  async (job) => {
    console.log(`Processing job ${job.id}`);
    console.log("Attempt:", job.attemptsMade + 1);

    if (job.data.message.includes("[FAIL]")) {
      throw new Error("Simulated notification delivery failure");
    }

    switch (job.data.channel) {
      case "email":
        await sendEmail(job.data);
        break;

      case "in-app":
        await sendInAppNotification(job.data);
        break;

      default:
        throw new Error(
          `Unsupported notification channel: ${job.data.channel}`,
        );
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
