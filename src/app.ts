import express from "express";
import { notificationQueue } from "./queues/notification.queue.js";
import { NotificationPayload } from "./types/notification.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.post("/notifications", async (req, res) => {
  const { recipient, message } = req.body;

  if (
    typeof recipient !== "string" ||
    recipient.trim() === "" ||
    typeof message !== "string" ||
    message.trim() === ""
  ) {
    return res.status(400).json({
      error: "Recipient and message are required.",
    });
  }

  try {
    const payload: NotificationPayload = {
      recipient: recipient.trim(),
      message: message.trim(),
      channel: "email",
    };

    const job = await notificationQueue.add("send-notification", payload, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: {
        //Retain up to 1,000 recent completed jobs.
        count: 1000,
      },
      removeOnFail: {
        age: 24 * 60 * 60, //Allow failed jobs to be removed after 24 hours.
        count: 5000, //Keep no more than 5,000 failed jobs.
      },
    });

    return res.status(202).json({
      message: "Notification queued successfully.",
      jobId: job.id,
    });
  } catch (error) {
    console.error("Failed to queue notification:", error);

    return res.status(500).json({
      error: "Failed to queue notification.",
    });
  }
});

app.get("/notifications/:id", async (req, res) => {
  try {
    const jobId = String(req.params.id);
    const job = await notificationQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: "Notification job not found.",
      });
    }

    const status = await job.getState();

    return res.status(200).json({
      jobId: job.id,
      status,
      recipient: job.data.recipient,
      message: job.data.message,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason || null,
    });
  } catch (error) {
    console.error("Failed to retrieve notification status:", error);

    return res.status(500).json({
      error: "Failed to retrieve notification status.",
    });
  }
});

export default app;
