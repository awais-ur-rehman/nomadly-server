import { User } from "../../users/models/user.model";
import { Consultation } from "../../marketplace/models/consultation.model";
import { JobPayment } from "../../marketplace/models/job-payment.model";
import { Job } from "../../marketplace/models/job.model";
import { logger } from "../../../utils/logger";

export class PaymentService {
  async handleRevenueCatWebhook(event: any) {
    logger.info("--------------- REVENUECAT WEBHOOK RECEIVED ---------------");

    // Fix: RevenueCat payload sends data inside an 'event' object
    // Structure: { event: { type: '...', ... }, api_version: '...' }
    const eventData = event.event || event;

    const { type, app_user_id, product_id, subscriber_attributes } = eventData;
    const event_type = type; // Map 'type' to 'event_type' for internal consistency

    logger.info(`Event Type: ${event_type}`);
    logger.info(`App User ID: ${app_user_id}`);
    logger.info(`Product ID: ${product_id}`);

    if (subscriber_attributes) {
      // logger.info({ subscriber_attributes }, "Subscriber Attributes");
    }

    try {
      switch (event_type) {
        case "INITIAL_PURCHASE":
        case "RENEWAL":
          if (!app_user_id || !product_id) {
            logger.warn("Missing app_user_id or product_id for activation");
            return;
          }
          logger.info(`Processing activation for User ${app_user_id} with Product ${product_id}`);
          await this.activateSubscription(app_user_id, product_id);
          break;
        case "CANCELLATION":
        case "EXPIRATION":
          if (!app_user_id) {
            logger.warn("Missing app_user_id for deactivation");
            return;
          }
          logger.info(`Processing deactivation for User ${app_user_id}`);
          await this.deactivateSubscription(app_user_id);
          break;
        case "NON_RENEWING_PURCHASE":
          // One-time purchase (e.g., job service fee)
          if (!app_user_id || !product_id) {
            logger.warn("Missing app_user_id or product_id for one-time purchase");
            return;
          }
          if (product_id.includes("job")) {
            logger.info(`Processing job payment for User ${app_user_id}`);
            await this.handleJobPayment(app_user_id, product_id, eventData);
          }
          break;
        case "TEST":
          // logger.info("Test event received");
          break;
        default:
          logger.warn({ event_type }, "Unknown or unhandled RevenueCat event type");
      }
    } catch (error) {
      logger.error({ error }, "Error processing webhook");
    }
  }

  private async activateSubscription(userId: string, productId: string) {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn({ userId }, "User not found for subscription activation");
      return;
    }

    const isVantagePro = productId.includes("vantage_pro");
    const isAnnual = productId.toLowerCase().includes("annual") || productId.toLowerCase().includes("yearly");

    // Default to 1 month (31 days) unless it's annual
    const durationMs = isAnnual
      ? 365 * 24 * 60 * 60 * 1000
      : 31 * 24 * 60 * 60 * 1000;

    user.subscription = {
      status: "active",
      plan: isVantagePro ? "vantage_pro" : "free",
      expires_at: new Date(Date.now() + durationMs),
      revenue_cat_id: productId,
    };

    // Grant unlimited invites for Pro users
    if (isVantagePro) {
      user.invite_count = 9999;
    }

    await user.save();
    logger.info({ userId, productId }, "Subscription activated");
  }

  private async deactivateSubscription(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn({ userId }, "User not found for subscription deactivation");
      return;
    }

    user.subscription.status = "expired";
    await user.save();
    logger.info({ userId }, "Subscription deactivated");
  }

  async updateConsultationPayment(consultationId: string, paymentId: string): Promise<any> {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      throw new Error("Consultation not found");
    }

    consultation.payment_status = "paid";
    consultation.payment_id = paymentId;
    consultation.status = "accepted";
    await consultation.save();

    return consultation;
  }

  async getSubscriptionStatus(userId: string) {
    const user = await User.findById(userId).select("subscription");
    if (!user) {
      throw new Error("User not found");
    }

    return user.subscription;
  }

  private async handleJobPayment(userId: string, productId: string, eventData: any) {
    try {
      // Find the most recent pending payment for this user
      const payment = await JobPayment.findOne({
        payer_id: userId,
        status: "pending",
      }).sort({ created_at: -1 });

      if (!payment) {
        logger.warn({ userId }, "No pending job payment found for user");
        return;
      }

      // Mark payment as paid
      payment.status = "paid";
      payment.revenue_cat_transaction_id = eventData.transaction_id || eventData.original_transaction_id || productId;
      await payment.save();

      // Mark the job as closed
      await Job.findByIdAndUpdate(payment.job_id, { status: "closed" });

      logger.info({ userId, jobId: payment.job_id, paymentId: payment._id }, "Job payment processed via webhook");
    } catch (error) {
      logger.error({ error, userId }, "Error processing job payment webhook");
    }
  }
}
