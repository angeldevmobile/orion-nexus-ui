import { Request, Response } from 'express';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse } from '../types/api';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Stripe v22 usa export = function (no es una clase), se importa con require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeLib = require('stripe');

// Inicialización lazy para evitar errores en el arranque si la clave no está configurada aún
let _stripe: ReturnType<typeof StripeLib> | null = null;

const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw createError('STRIPE_SECRET_KEY not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    _stripe = StripeLib(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

const PLAN_AMOUNTS: Record<string, number> = {
  pro: 2900,        // $29.00 USD en centavos
  enterprise: 9900, // $99.00 USD en centavos
};

// POST /api/payments/create-payment-intent
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { planName } = req.body;
  const userId = req.user?.id;

  if (!userId) throw createError('Authentication required', HTTP_STATUS.UNAUTHORIZED);

  const amount = PLAN_AMOUNTS[planName?.toLowerCase()];
  if (!amount) throw createError('Invalid plan name', HTTP_STATUS.BAD_REQUEST);

  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { userId, planName: planName.toLowerCase() },
  });

  const response: ApiResponse = {
    success: true,
    message: 'Payment intent created',
    data: { clientSecret: paymentIntent.client_secret },
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// POST /api/payments/create-checkout-session
export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const { planName } = req.body;
  const userId = req.user?.id;

  if (!userId) throw createError('Authentication required', HTTP_STATUS.UNAUTHORIZED);

  const amount = PLAN_AMOUNTS[planName?.toLowerCase()];
  if (!amount) throw createError('Invalid plan name', HTTP_STATUS.BAD_REQUEST);

  const stripe = getStripe();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'link'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Orion Nexus — Plan ${planName}`,
            description: `Suscripción mensual al plan ${planName}`,
          },
          unit_amount: amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${frontendUrl}/pricing?payment=success&plan=${planName.toLowerCase()}`,
    cancel_url: `${frontendUrl}/pricing?payment=cancelled`,
    metadata: { userId, planName: planName.toLowerCase() },
  });

  const response: ApiResponse = {
    success: true,
    message: 'Checkout session created',
    data: { sessionUrl: session.url },
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// POST /api/payments/webhook
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const stripe = getStripe();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;

  if (webhookSecret && sig) {
    try {
      const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
      if (!rawBody) throw new Error('rawBody not available');
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      throw createError(
        `Webhook signature failed: ${(err as Error).message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  } else {
    // Desarrollo sin webhook secret — aceptar body directo
    event = req.body;
  }

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
  };

  switch (event?.type) {
    case 'checkout.session.completed': {
      const { userId, planName } = event.data?.object?.metadata || {};
      if (userId && planName) await updateSubscription(userId, planName);
      break;
    }
    case 'payment_intent.succeeded': {
      const { userId, planName } = event.data?.object?.metadata || {};
      if (userId && planName) await updateSubscription(userId, planName);
      break;
    }
    case 'customer.subscription.deleted': {
      const { userId } = event.data?.object?.metadata || {};
      if (userId) await updateSubscription(userId, 'free');
      break;
    }
  }

  res.json({ received: true });
});
