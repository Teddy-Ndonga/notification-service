import express from "express";
import { notificationQueue } from "./queues/notification.queue.js";

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
    const job = await notificationQueue.add("send-notification", {
      recipient: recipient.trim(),
      message: message.trim(),
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

export default app;
