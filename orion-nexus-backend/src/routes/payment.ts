import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createCheckoutSession, handleWebhook, cancelSubscriptionHandler } from '../controllers/paymentController';

const router = express.Router();

// Crear sesión de checkout con Lemon Squeezy
router.post('/checkout', authenticateToken, createCheckoutSession);

// Cancelar suscripción activa y volver a plan free
router.delete('/subscription', authenticateToken, cancelSubscriptionHandler);

// Webhook de Lemon Squeezy — verificado por firma HMAC, NO por JWT
router.post('/webhook', handleWebhook);

export default router;
