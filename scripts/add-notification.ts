import { notificationQueue } from "../src/queues/notification.queue.js";

async function main() {
  const job = await notificationQueue.add("send-notification", {
    recipient: "teddy@example.com",
    message: "Your first queued notification!",
    channel: "email",
  });

  console.log(`Notification job added with ID: ${job.id}`);

  await notificationQueue.close();
}

main().catch((error: unknown) => {
  console.error("Failed to add notification job:", error);
  process.exitCode = 1;
});
