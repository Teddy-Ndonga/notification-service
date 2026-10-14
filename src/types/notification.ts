export type NotificationChannel = "email" | "in-app";

export interface NotificationPayload {
  recipient: string;
  message: string;
  channel: NotificationChannel;
}
