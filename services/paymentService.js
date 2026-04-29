const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

// Create Stripe checkout session for Pro plan upgrade
async function createCheckoutSession(userId, userEmail) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PDF Simpler Pro Plan',
              description: 'Unlimited PDF tools and priority processing',
            },
            unit_amount: 499, // $4.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.BASE_URL}/dashboard.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/pricing.html`,
      customer_email: userEmail,
      metadata: {
        userId: userId.toString(),
      },
    });

    return session;
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    throw new Error('Failed to create checkout session');
  }
}

// Handle Stripe webhook events
async function handleWebhook(event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// Handle successful checkout
async function handleCheckoutCompleted(session) {
  try {
    const userId = session.metadata.userId;

    if (!userId) {
      console.error('No userId in session metadata');
      return;
    }

    // Update user plan to Pro
    await db.query(
      'UPDATE users SET plan = ? WHERE id = ?',
      ['pro', userId]
    );

    console.log(`User ${userId} upgraded to Pro plan`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription) {
  try {
    const customerId = subscription.customer;

    // Find user by Stripe customer ID
    const [users] = await db.query(
      'SELECT id FROM users WHERE stripe_customer_id = ?',
      [customerId]
    );

    if (users.length > 0) {
      const userId = users[0].id;

      // Downgrade user to Free plan
      await db.query(
        'UPDATE users SET plan = ?, stripe_customer_id = NULL WHERE id = ?',
        ['free', userId]
      );

      console.log(`User ${userId} downgraded to Free plan`);
    }
  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  try {
    const customerId = invoice.customer;

    // Ensure user is still on Pro plan
    const [users] = await db.query(
      'SELECT id FROM users WHERE stripe_customer_id = ?',
      [customerId]
    );

    if (users.length > 0) {
      const userId = users[0].id;

      // Reset daily task count for Pro users
      await db.query(
        'UPDATE users SET tasks_today = 0, last_reset = CURDATE() WHERE id = ?',
        [userId]
      );

      console.log(`Reset tasks for Pro user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

// Get subscription status
async function getSubscriptionStatus(userId) {
  try {
    const [users] = await db.query(
      'SELECT plan, stripe_customer_id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    if (user.plan !== 'pro' || !user.stripe_customer_id) {
      return {
        plan: user.plan,
        isActive: user.plan === 'pro',
      };
    }

    // Get subscription details from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return {
        plan: user.plan,
        isActive: false,
      };
    }

    const subscription = subscriptions.data[0];

    return {
      plan: 'pro',
      isActive: true,
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw new Error('Failed to get subscription status');
  }
}

// Cancel subscription
async function cancelSubscription(userId) {
  try {
    const [users] = await db.query(
      'SELECT stripe_customer_id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    if (!user.stripe_customer_id) {
      throw new Error('No active subscription found');
    }

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      throw new Error('No active subscription found');
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      subscriptions.data[0].id,
      { cancel_at_period_end: true }
    );

    return {
      success: true,
      cancelAt: new Date(subscription.cancel_at * 1000),
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
};