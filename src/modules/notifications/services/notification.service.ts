import { logger } from "../../../utils/logger";

export class NotificationService {
  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    logger.info({ userId, title, body, data }, "Push notification sent");
  }

  async sendMatchNotification(userId: string, matchedUserId: string) {
    await this.sendPushNotification(
      userId,
      "New Match!",
      "You have a new mutual match",
      { type: "match", matchedUserId }
    );
  }

  async sendActivityApprovalNotification(userId: string, activityId: string) {
    await this.sendPushNotification(
      userId,
      "Activity Join Approved",
      "Your request to join an activity has been approved",
      { type: "activity_approval", activityId }
    );
  }

  async sendVouchNotification(userId: string, voucherId: string) {
    await this.sendPushNotification(
      userId,
      "New Vouch Received",
      "Someone vouched for you",
      { type: "vouch", voucherId }
    );
  }
}
