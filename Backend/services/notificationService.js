import Notification from "../Models/Notification.js";

export async function createInAppNotification({
  recipient,
  eventType,
  title,
  message,
  payload = {},
}) {
  if (!recipient || !eventType || !title || !message) {
    return null;
  }

  return Notification.create({
    recipient,
    channel: "in_app",
    eventType,
    title,
    message,
    payload,
  });
}
