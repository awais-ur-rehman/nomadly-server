import { logger } from "../../../utils/logger";
import { Notification } from "../models/notification.model";

export class NotificationService {
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    type: string,
    data?: any
  ) {
    try {
      // 1. Persist to database
      await Notification.create({
        user_id: userId,
        title,
        body,
        type,
        data,
      });

      // 2. Log (Simulating external push service)
      logger.info({ userId, title, body, data }, "Push notification sent and saved");
    } catch (error) {
      logger.error({ error, userId }, "Failed to save/send notification");
    }
  }

  async sendMatchNotification(userId: string, matchedUserId: string) {
    await this.sendPushNotification(
      userId,
      "New Match!",
      "You have a new mutual match",
      "match",
      { matchedUserId }
    );
  }

  async sendActivityApprovalNotification(userId: string, activityId: string) {
    await this.sendPushNotification(
      userId,
      "Activity Join Approved",
      "Your request to join an activity has been approved",
      "activity_approval",
      { activityId }
    );
  }

  async sendVouchNotification(userId: string, voucherId: string) {
    await this.sendPushNotification(
      userId,
      "New Vouch Received",
      "Someone vouched for you",
      "vouch",
      { voucherId }
    );
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return Notification.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
  }
}
