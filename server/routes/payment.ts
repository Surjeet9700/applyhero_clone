import express from 'express';
import { protect } from '../middleware/auth'; // Import the standard auth middleware
import { createCheckoutSession, handleWebhook } from '../controllers/paymentController'; // Import payment controllers

const router = express.Router();

// Route to create a Stripe Checkout Session
router.post('/create-checkout-session', protect, createCheckoutSession);

// Route for Stripe webhooks
// IMPORTANT: This route needs the raw body, not JSON.
// In your main server file (index.ts), you need to add a specific middleware
// for this route *before* the general express.json() middleware.
// Example: app.post('/api/payment/webhook', express.raw({type: 'application/json'}), handleWebhook);
router.post('/webhook', handleWebhook);


export default router;
