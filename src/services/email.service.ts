import type { NotificationPayload } from "../types/notification.js";

export async function sendEmail(
  notification: NotificationPayload,
): Promise<void> {
  console.log("Sending email notification...");
  console.log("Recipient:", notification.recipient);
  console.log("Message:", notification.message);

  // Simulate successful email processing.
  console.log("Email notification sent successfully.");
}
