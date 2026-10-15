import { redisPublisher } from "../redis-publisher.js";
import type { NotificationPayload } from "../types/notification.js";

export async function sendInAppNotification(
  notification: NotificationPayload,
): Promise<void> {
  console.log("Processing in-app notification...");
  console.log("Recipient:", notification.recipient);
  console.log("Message:", notification.message);

  await redisPublisher.publish(
    "in-app-notifications",
    JSON.stringify({
      recipient: notification.recipient,
      message: notification.message,
    }),
  );

  // Simulate storing an in-app notification.
  console.log("In-app notification event published.");
}
