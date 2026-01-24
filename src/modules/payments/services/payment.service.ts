import { User } from "../../users/models/user.model";
import { Consultation } from "../../marketplace/models/consultation.model";
import { logger } from "../../../utils/logger";

export class PaymentService {
  async handleRevenueCatWebhook(event: any) {
    logger.info({ event }, "RevenueCat webhook received");

    const { event_type, app_user_id, product_id } = event;

    switch (event_type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
        await this.activateSubscription(app_user_id, product_id);
        break;
      case "CANCELLATION":
      case "EXPIRATION":
        await this.deactivateSubscription(app_user_id);
        break;
      default:
        logger.warn({ event_type }, "Unknown RevenueCat event type");
    }
  }

  private async activateSubscription(userId: string, productId: string) {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn({ userId }, "User not found for subscription activation");
      return;
    }

    const isVantagePro = productId.includes("vantage_pro");

    user.subscription = {
      status: "active",
      plan: isVantagePro ? "vantage_pro" : "free",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      revenue_cat_id: productId,
    };

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

  async updateConsultationPayment(consultationId: string, paymentId: string) {
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
}
