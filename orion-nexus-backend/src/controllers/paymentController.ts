import { Request, Response } from 'express';
import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
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

// Variant IDs por plan (configura estos en el .env)
const PLAN_VARIANTS: Record<string, string> = {
  pro: process.env.LS_VARIANT_PRO ?? '',
  enterprise: process.env.LS_VARIANT_ENTERPRISE ?? '',
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
  const validPlans = ['free', 'pro', 'enterprise'] as const;
  const normalizedPlan = planName.toLowerCase() as typeof validPlans[number];
  if (validPlans.includes(normalizedPlan)) {
    await initializeCredits(userId, normalizedPlan);
  }
};

// POST /api/payments/checkout
export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const { planName } = req.body;
  const userId = req.user?.id;
  const userEmail = req.user?.email;

  if (!userId) throw createError('Authentication required', HTTP_STATUS.UNAUTHORIZED);

  const variantId = PLAN_VARIANTS[planName?.toLowerCase()];
  if (!variantId) throw createError('Invalid plan name or variant not configured', HTTP_STATUS.BAD_REQUEST);

  const storeId = process.env.LS_STORE_ID;
  if (!storeId) throw createError('LS_STORE_ID not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  getLS();

  const checkout = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: userEmail ?? undefined,
      custom: { userId, planName: planName.toLowerCase() },
    },
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
    },
    productOptions: {
      redirectUrl: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      receiptButtonText: 'Ir al Dashboard',
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

  if (eventName === 'subscription_created' || eventName === 'order_created') {
    const custom = meta?.custom_data ?? data?.attributes?.first_order_item?.custom_data ?? {};
    const userId: string = custom.userId ?? custom.user_id;
    const planName: string = custom.planName ?? custom.plan_name;

    if (userId && planName) {
      // Verificar suscripción activa vía API si es subscription_created
      if (eventName === 'subscription_created') {
        const subId = data?.id;
        if (subId) {
          getLS();
          const sub = await getSubscription(subId);
          if (sub.data?.data.attributes.status === 'active' || sub.data?.data.attributes.status === 'on_trial') {
            await updateSubscription(userId, planName);
          }
        }
      } else {
        await updateSubscription(userId, planName);
      }
    }
  }

  res.json({ received: true });
});


