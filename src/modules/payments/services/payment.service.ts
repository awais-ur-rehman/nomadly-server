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

    // Determine subscription duration from product ID
    const pid = productId.toLowerCase();
    const isAnnual = pid.includes("annual") || pid.includes("yearly");
    const isWeekly = pid.includes("weekly") || pid.includes("week");

    const durationMs = isAnnual
      ? 365 * 24 * 60 * 60 * 1000
      : isWeekly
        ? 7 * 24 * 60 * 60 * 1000
        : 31 * 24 * 60 * 60 * 1000; // default monthly

    // Treat ALL paid subscription products as Pro
    user.subscription = {
      status: "active",
      plan: "vantage_pro",
      expires_at: new Date(Date.now() + durationMs),
      revenue_cat_id: productId,
    };

    // Grant Pro benefits: unlimited invites and reset AI usage
    user.invite_count = 9999;
    user.ai_usage = { count: 0, last_reset: new Date() };

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

  async syncSubscription(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const apiKey = process.env.REVENUECAT_API_KEY;
    if (!apiKey) throw new Error("RevenueCat API Key not configured");

    try {
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`RevenueCat API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const subscriber = data.subscriber;
      const entitlements = subscriber?.entitlements?.active || {};

      // Check if user has ANY active entitlement (all paid products grant Pro)
      const isPro = Object.keys(entitlements).length > 0;

      // Also check entitlements via product_id if entitlement logic is ambiguous
      // const activeSubscriptions = subscriber.subscriptions; // Map of product_id -> details

      if (isPro) {
        // Find the product ID causing this entitlement
        const entitlementKey = Object.keys(entitlements)[0];
        const productId = entitlements[entitlementKey]?.product_identifier;

        await this.activateSubscription(userId, productId || 'unknown_pro_product');
      } else {
        // If they were pro but now have no active pro entitlements
        if (user.subscription?.plan === 'vantage_pro') {
          await this.deactivateSubscription(userId);
        }
      }

      return await this.getSubscriptionStatus(userId);
    } catch (error) {
      logger.error({ error, userId }, "Failed to sync subscription");
      throw error;
    }
  }
}
