import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createPaymentIntent,
  createCheckoutSession,
  handleWebhook,
} from '../controllers/paymentController';

const router = express.Router();

// Endpoints autenticados (requieren JWT)
router.post('/create-payment-intent', authenticateToken, createPaymentIntent);
router.post('/create-checkout-session', authenticateToken, createCheckoutSession);

// Webhook de Stripe — autenticado por firma, NO por JWT
router.post('/webhook', handleWebhook);

export default router;
