const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get user dashboard (requires authentication)
router.get('/dashboard', authMiddleware(true), userController.dashboard);

// Upgrade to Pro (requires authentication)
router.post('/upgrade', authMiddleware(true), userController.upgrade);

// Get subscription status (requires authentication)
router.get('/subscription', authMiddleware(true), userController.getSubscriptionStatus);

// Cancel subscription (requires authentication)
router.post('/cancel-subscription', authMiddleware(true), userController.cancelSubscription);

// Get user analytics (requires authentication)
router.get('/analytics', authMiddleware(true), userController.getAnalytics);

// Get statistics summary (requires authentication)
router.get('/stats-summary', authMiddleware(true), userController.getStatsSummary);

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).json({ error: `Webhook signature verification failed` });
  }

  try {
    await paymentService.handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router;
