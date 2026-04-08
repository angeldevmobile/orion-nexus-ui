import { Request, Response } from 'express';
import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription as lsCancelSubscription,
} from '@lemonsqueezy/lemonsqueezy.js';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse } from '../types/api';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { initializeCredits } from '../services/creditService';
import crypto from 'crypto';

// Inicialización lazy de Lemon Squeezy
let _lsReady = false;
const getLS = () => {
  if (!_lsReady) {
    if (!process.env.LS_API_KEY) {
      throw createError('LS_API_KEY not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    lemonSqueezySetup({ apiKey: process.env.LS_API_KEY });
    _lsReady = true;
  }
};

// Variant IDs por plan y período de facturación (configura estos en el .env)
// Cada variante corresponde a un producto en Lemon Squeezy con su ciclo de facturación
const PLAN_VARIANTS: Record<string, string> = {
  pro:               process.env.LS_VARIANT_PRO            ?? '',
  pro_annual:        process.env.LS_VARIANT_PRO_ANNUAL      ?? '',
  business:          process.env.LS_VARIANT_BUSINESS        ?? '',
  business_annual:   process.env.LS_VARIANT_BUSINESS_ANNUAL ?? '',
  enterprise:        process.env.LS_VARIANT_ENTERPRISE      ?? '',
};

const updateSubscription = async (userId: string, planName: string) => {
  await pool.query(
    `UPDATE users
     SET preferences = jsonb_set(
       COALESCE(preferences, '{}')::jsonb,
       '{subscription}',
       to_jsonb($2::text)
     ), updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [userId, planName]
  );

  // Inicializar / resetear créditos al nuevo plan
  const validPlans = ['free', 'pro', 'business', 'enterprise'] as const;
  type ValidPlan = typeof validPlans[number];
  const normalizedPlan = planName.toLowerCase() as ValidPlan;
  if ((validPlans as readonly string[]).includes(normalizedPlan)) {
    await initializeCredits(userId, normalizedPlan);
  }
};

// POST /api/payments/checkout
export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const { planName, billing } = req.body;          // billing: 'monthly' | 'annual'
  const userId = req.user?.id;
  const userEmail = req.user?.email;

  if (!userId) throw createError('Authentication required', HTTP_STATUS.UNAUTHORIZED);

  const isAnnual = billing === 'annual';
  const variantKey = isAnnual
    ? `${planName?.toLowerCase()}_annual`
    : planName?.toLowerCase();

  const variantId = PLAN_VARIANTS[variantKey ?? ''];
  if (!variantId) throw createError('Invalid plan/billing combination or variant not configured', HTTP_STATUS.BAD_REQUEST);

  const storeId = process.env.LS_STORE_ID;
  if (!storeId) throw createError('LS_STORE_ID not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  getLS();

  const normalizedPlan = planName.toLowerCase();

  const checkout = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: userEmail ?? undefined,
      custom: {
        userId,
        planName: normalizedPlan,
        billing: isAnnual ? 'annual' : 'monthly',
      },
    },
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
    },
    productOptions: {
      redirectUrl: `${process.env.FRONTEND_URL}/pricing?payment=success&plan=${normalizedPlan}`,
      receiptButtonText: 'Ver mis planes',
    },
  });

  if (checkout.error) {
    console.error('LS checkout error:', JSON.stringify(checkout.error));
    throw createError(checkout.error.message ?? 'Failed to create checkout', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Checkout created',
    data: { checkoutUrl: checkout.data?.data.attributes.url },
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// POST /api/payments/webhook
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const secret = process.env.LS_WEBHOOK_SECRET;
  if (!secret) throw createError('LS_WEBHOOK_SECRET not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  // Verificar firma HMAC
  const signature = req.headers['x-signature'] as string;
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody || !signature) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Missing signature or body' });
    return;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(rawBody).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid signature' });
    return;
  }

  const { meta, data } = req.body;
  const eventName: string = meta?.event_name ?? '';

  // ── Suscripción o pago único creado ──────────────────────────────────────
  if (eventName === 'subscription_created' || eventName === 'order_created') {
    const custom = meta?.custom_data ?? data?.attributes?.first_order_item?.custom_data ?? {};
    const userId: string = custom.userId ?? custom.user_id;
    const planName: string = custom.planName ?? custom.plan_name;

    if (userId && planName) {
      if (eventName === 'subscription_created') {
        const subId = data?.id;
        if (subId) {
          getLS();
          const sub = await getSubscription(subId);
          const status = sub.data?.data.attributes.status;
          if (status === 'active' || status === 'on_trial') {
            await updateSubscription(userId, planName);
            await pool.query(
              `UPDATE users
               SET preferences = jsonb_set(
                 COALESCE(preferences, '{}')::jsonb,
                 '{ls_subscription_id}',
                 to_jsonb($2::text)
               ), updated_at = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [userId, subId]
            );
          }
        }
      } else {
        // order_created: pago único (no suscripción)
        await updateSubscription(userId, planName);
      }
    }
  }

  // ── Cambio de plan (upgrade / downgrade) ─────────────────────────────────
  if (eventName === 'subscription_updated') {
    const subId = data?.id as string | undefined;
    if (subId) {
      const custom = meta?.custom_data ?? {};
      const userId: string = custom.userId ?? custom.user_id;
      const planName: string = custom.planName ?? custom.plan_name;
      const lsStatus: string = data?.attributes?.status ?? '';

      if (userId && planName && (lsStatus === 'active' || lsStatus === 'on_trial')) {
        await updateSubscription(userId, planName);
      }

      // Si LS marca la suscripción como cancelada inmediatamente → bajar a free
      if (lsStatus === 'cancelled' || lsStatus === 'expired') {
        const userResult = await pool.query(
          `SELECT id FROM users WHERE preferences->>'ls_subscription_id' = $1`,
          [subId]
        );
        if (userResult.rows.length > 0) {
          const uid: string = userResult.rows[0].id.toString();
          await updateSubscription(uid, 'free');
        }
      }
    }
  }

  // ── Suscripción cancelada inmediatamente ──────────────────────────────────
  if (eventName === 'subscription_cancelled') {
    const subId = data?.id as string | undefined;
    if (subId) {
      const endsAt: string | null = data?.attributes?.ends_at ?? null;
      // Solo marcar como pending_cancellation; cuando expire, subscription_expired baja a free
      await pool.query(
        `UPDATE users
         SET preferences = preferences
           || jsonb_build_object(
                'subscription_status', 'pending_cancellation',
                'ls_subscription_ends_at', $2::text
              ),
             updated_at = CURRENT_TIMESTAMP
         WHERE preferences->>'ls_subscription_id' = $1`,
        [subId, endsAt ?? '']
      );
    }
  }

  // ── Suscripción expirada definitivamente → bajar a free ───────────────────
  if (eventName === 'subscription_expired') {
    const subId = data?.id as string | undefined;
    if (subId) {
      const userResult = await pool.query(
        `SELECT id FROM users WHERE preferences->>'ls_subscription_id' = $1`,
        [subId]
      );
      if (userResult.rows.length > 0) {
        const userId: string = userResult.rows[0].id.toString();
        await updateSubscription(userId, 'free');
        await pool.query(
          `UPDATE users
           SET preferences = preferences
             - 'ls_subscription_id'
             - 'ls_subscription_ends_at'
             - 'subscription_status',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [userId]
        );
      }
    }
  }

  res.json({ received: true });
});

// DELETE /api/payments/subscription
// Cancela al final del período: el usuario conserva su plan hasta ends_at.
// El webhook subscription_expired se encarga de bajar a free cuando vence.
export const cancelSubscriptionHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw createError('Authentication required', HTTP_STATUS.UNAUTHORIZED);

  const userResult = await pool.query(
    `SELECT preferences FROM users WHERE id = $1`,
    [userId]
  );
  if (userResult.rows.length === 0) throw createError('User not found', HTTP_STATUS.NOT_FOUND);

  const prefs = (userResult.rows[0].preferences ?? {}) as Record<string, unknown>;
  const subId = prefs.ls_subscription_id as string | undefined;

  let endsAt: string | null = null;

  if (subId) {
    getLS();
    const result = await lsCancelSubscription(subId);
    if (result.error) {
      throw createError(
        result.error.message ?? 'Failed to cancel subscription with Lemon Squeezy',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
    // LS devuelve ends_at con la fecha real de expiración del período actual
    endsAt = (result.data?.data.attributes.ends_at as string | null | undefined) ?? null;
  }

  // Marcar como cancelación pendiente sin bajar el plan todavía
  await pool.query(
    `UPDATE users
     SET preferences = preferences
       || jsonb_build_object(
            'subscription_status', 'pending_cancellation',
            'ls_subscription_ends_at', $2::text
          ),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [userId, endsAt ?? '']
  );

  const response: ApiResponse = {
    success: true,
    message: 'Subscription will be cancelled at the end of the current billing period',
    data: { endsAt },
  };

  res.status(HTTP_STATUS.OK).json(response);
});

