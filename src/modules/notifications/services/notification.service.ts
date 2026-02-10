import { logger } from "../../../utils/logger";
import { Notification, type NotificationType } from "../models/notification.model";

export class NotificationService {
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
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
      // logger.info({ userId, title, body, data }, "Push notification sent and saved");
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

  // ==========================================
  // Marketplace Notifications
  // ==========================================

  /**
   * Notify job author when someone applies to their job
   */
  async sendJobApplicationNotification(
    jobAuthorId: string,
    applicantName: string,
    jobTitle: string,
    jobId: string,
    applicantId: string
  ) {
    await this.sendPushNotification(
      jobAuthorId,
      "New Job Application",
      `${applicantName} applied to your job: ${jobTitle}`,
      "job_application",
      { jobId, applicantId }
    );
  }

  /**
   * Notify applicant when their application status changes
   */
  async sendApplicationStatusNotification(
    applicantId: string,
    jobTitle: string,
    status: "interview" | "hired" | "rejected",
    jobId: string
  ) {
    const statusMessages: Record<string, { title: string; body: string }> = {
      interview: {
        title: "Interview Scheduled",
        body: `Great news! You've been selected for an interview for: ${jobTitle}`,
      },
      hired: {
        title: "Congratulations! You're Hired",
        body: `You've been hired for: ${jobTitle}`,
      },
      rejected: {
        title: "Application Update",
        body: `Your application for ${jobTitle} was not selected this time`,
      },
    };

    const message = statusMessages[status];
    await this.sendPushNotification(
      applicantId,
      message.title,
      message.body,
      "application_status",
      { jobId, status }
    );
  }

  /**
   * Notify builder when someone requests a consultation
   */
  async sendConsultationRequestNotification(
    builderId: string,
    requesterName: string,
    specialty: string,
    consultationId: string,
    requesterId: string
  ) {
    await this.sendPushNotification(
      builderId,
      "New Consultation Request",
      `${requesterName} wants to book a consultation for ${specialty}`,
      "consultation_request",
      { consultationId, requesterId }
    );
  }

  /**
   * Notify requester when builder accepts their consultation
   */
  async sendConsultationAcceptedNotification(
    requesterId: string,
    builderName: string,
    consultationId: string,
    builderId: string
  ) {
    await this.sendPushNotification(
      requesterId,
      "Consultation Confirmed",
      `${builderName} accepted your consultation request`,
      "consultation_accepted",
      { consultationId, builderId }
    );
  }

  /**
   * Notify builder when they receive a new review
   */
  async sendNewReviewNotification(
    builderId: string,
    reviewerName: string,
    rating: number,
    reviewId: string,
    reviewerId: string
  ) {
    await this.sendPushNotification(
      builderId,
      "New Review Received",
      `${reviewerName} left you a ${rating}-star review`,
      "new_review",
      { reviewId, reviewerId, rating }
    );
  }

  // ==========================================
  // Mark as Read
  // ==========================================

  async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user_id: userId },
      { is_read: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string) {
    return Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ user_id: userId, is_read: false });
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user_id: userId })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user_id: userId }),
      Notification.countDocuments({ user_id: userId, is_read: false }),
    ]);

    return { notifications, total, unreadCount };
  }
}
