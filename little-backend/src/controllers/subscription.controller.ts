import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

function serializeSubscription(sub: {
  plan: string;
  status: string;
  trialEndsAt: Date | null;
  renewsAt: Date | null;
  childrenIncluded: number;
} | null) {
  if (!sub) {
    return { plan: "free", status: "none", trialEndsAt: null, renewsAt: null, childrenIncluded: 1 };
  }
  return {
    plan: sub.plan,
    status: sub.status,
    trialEndsAt: sub.trialEndsAt?.toISOString() ?? null,
    renewsAt: sub.renewsAt?.toISOString() ?? null,
    childrenIncluded: sub.childrenIncluded,
  };
}

export async function getSubscription(req: Request, res: Response) {
  const sub = await prisma.subscription.findUnique({ where: { userId: req.userId } });
  res.status(200).json(serializeSubscription(sub));
}

/**
 * Receives RevenueCat webhook events (https://www.revenuecat.com/docs/webhooks)
 * and syncs local Subscription state. RevenueCat is the suggested path
 * because it unifies App Store + Play Store billing behind one webhook
 * instead of handling Apple's and Google's server notifications separately.
 */
export async function handleRevenueCatWebhook(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (env.revenueCatWebhookSecret && authHeader !== `Bearer ${env.revenueCatWebhookSecret}`) {
    throw ApiError.unauthorized("Invalid webhook signature", "invalid_webhook_secret");
  }

  const event = req.body?.event;
  if (!event) {
    throw ApiError.badRequest("Missing event payload");
  }

  // RevenueCat's app_user_id should be set to our internal userId at
  // purchase time on the client, so we can map straight back to a user.
  const userId: string | undefined = event.app_user_id;
  if (!userId) {
    return res.status(200).json({ received: true, skipped: "no app_user_id" });
  }

  const eventType: string = event.type; // e.g. "INITIAL_PURCHASE", "RENEWAL", "CANCELLATION", "EXPIRATION", "BILLING_ISSUE"
  const productId: string | undefined = event.product_id;
  const plan = productId?.includes("yearly") ? "yearly" : "monthly";

  const statusByEvent: Record<string, string> = {
    INITIAL_PURCHASE: "active",
    RENEWAL: "active",
    UNCANCELLATION: "active",
    PRODUCT_CHANGE: "active",
    CANCELLATION: "canceled",
    EXPIRATION: "canceled",
    BILLING_ISSUE: "past_due",
  };
  const status = statusByEvent[eventType] ?? "active";

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      status,
      renewsAt: event.expiration_at_ms ? new Date(Number(event.expiration_at_ms)) : null,
      storeCustomerId: event.original_app_user_id ?? null,
    },
    update: {
      plan,
      status,
      renewsAt: event.expiration_at_ms ? new Date(Number(event.expiration_at_ms)) : null,
    },
  });

  res.status(200).json({ received: true });
}
