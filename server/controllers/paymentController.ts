import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import UserProfile from '../models/UserProfile'; // Import UserProfile model
import { User } from '@supabase/supabase-js'; // Import Supabase User type

dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10', // Use a recent API version
});

// Extend the Request type to include the user property added by the protect middleware
interface ProtectedRequest extends Request {
  user?: User; // Supabase user object
}

// @desc    Create a Stripe Checkout Session for a subscription
// @route   POST /api/payment/create-checkout-session
// @access  Private (Authenticated users)
export const createCheckoutSession = async (req: ProtectedRequest, res: Response) => {
  const supabaseUser = req.user; // User object attached by 'protect' middleware
  const { priceId } = req.body; // Expecting the Stripe Price ID from the frontend

  if (!supabaseUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!priceId) {
      return res.status(400).json({ message: 'Stripe Price ID is required.' });
  }

  try {
    // Find the user profile in MongoDB
    let userProfile = await UserProfile.findOne({ userId: supabaseUser.id });

    if (!userProfile) {
      // This shouldn't happen if protect middleware works, but handle defensively
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // If the user doesn't have a Stripe customer ID yet, create one
    if (!userProfile.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email, // Use the user's email
        metadata: {
            userId: userProfile.userId, // Link to your internal user ID
            profileId: userProfile._id.toString(), // Link to your MongoDB profile ID
        }
      });
      userProfile.stripeCustomerId = customer.id;
      await userProfile.save(); // Save the new customer ID to the user profile
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: userProfile.stripeCustomerId, // Use the user's Stripe Customer ID
      payment_method_types: ['card'], // Specify payment methods
      line_items: [
        {
          price: priceId, // The ID of the price object in Stripe
          quantity: 1,
        },
      ],
      mode: 'subscription', // Use 'subscription' mode for recurring payments
      success_url: `${process.env.VITE_FRONTEND_API_URL?.replace('/api', '')}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`, // Redirect URL on success
      cancel_url: `${process.env.VITE_FRONTEND_API_URL?.replace('/api', '')}/pricing?payment=canceled`, // Redirect URL on cancel
      metadata: {
          userId: userProfile.userId, // Include your internal user ID in session metadata
          profileId: userProfile._id.toString(), // Include your MongoDB profile ID
      }
    });

    // Respond with the session URL
    res.json({ url: session.url });

  } catch (error: any) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ message: 'Server error creating checkout session.' });
  }
};

// @desc    Handle Stripe Webhook events (for updating subscription status)
// @route   POST /api/payment/webhook
// @access  Public (Stripe only)
// NOTE: This is a basic structure. You need to implement proper webhook signature verification
// and handle relevant events like 'customer.subscription.created', 'customer.subscription.updated',
// 'customer.subscription.deleted', 'checkout.session.completed', etc.
export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!; // Your webhook secret

    let event: Stripe.Event;

    try {
        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.sendStatus(400); // Return a 400 error if the signature is invalid
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.CheckoutSession;
            console.log(`Checkout session completed: ${session.id}`);
            // Fulfill the purchase...
            // Retrieve the subscription ID from the session
            const subscriptionId = session.subscription as string;
            const customerId = session.customer as string;

            try {
                // Find the user profile by Stripe Customer ID or metadata
                const userProfile = await UserProfile.findOne({ stripeCustomerId: customerId });

                if (userProfile) {
                    // Retrieve the subscription object to get details like price ID and period end
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                    userProfile.subscriptionStatus = subscription.status;
                    userProfile.stripePriceId = subscription.items.data[0].price.id;
                    userProfile.currentPeriodEnd = new Date(subscription.current_period_end * 1000); // Convert timestamp to Date

                    await userProfile.save();
                    console.log(`User ${userProfile.userId} subscription updated to active.`);
                } else {
                    console.error(`User profile not found for Stripe customer ID: ${customerId}`);
                }
            } catch (dbError: any) {
                 console.error('Error updating user profile after checkout completion:', dbError.message);
            }

            break;
        case 'customer.subscription.updated':
             const subscriptionUpdated = event.data.object as Stripe.Subscription;
             console.log(`Subscription updated: ${subscriptionUpdated.id}`);
             // Handle subscription updates (e.g., status changes, plan changes)
             try {
                const userProfile = await UserProfile.findOne({ stripeCustomerId: subscriptionUpdated.customer as string });
                 if (userProfile) {
                    userProfile.subscriptionStatus = subscriptionUpdated.status;
                    userProfile.stripePriceId = subscriptionUpdated.items.data[0].price.id;
                    userProfile.currentPeriodEnd = new Date(subscriptionUpdated.current_period_end * 1000);
                    await userProfile.save();
                    console.log(`User ${userProfile.userId} subscription status updated to ${subscriptionUpdated.status}.`);
                 }
             } catch (dbError: any) {
                 console.error('Error updating user profile after subscription update:', dbError.message);
             }
            break;
        case 'customer.subscription.deleted':
            const subscriptionDeleted = event.data.object as Stripe.Subscription;
            console.log(`Subscription deleted: ${subscriptionDeleted.id}`);
            // Handle subscription cancellation
             try {
                const userProfile = await UserProfile.findOne({ stripeCustomerId: subscriptionDeleted.customer as string });
                 if (userProfile) {
                    userProfile.subscriptionStatus = 'canceled';
                    userProfile.stripePriceId = null; // Or keep the old price ID if needed
                    userProfile.currentPeriodEnd = null; // Or keep the old period end if needed
                    await userProfile.save();
                    console.log(`User ${userProfile.userId} subscription canceled.`);
                 }
             } catch (dbError: any) {
                 console.error('Error updating user profile after subscription deletion:', dbError.message);
             }
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.sendStatus(200);
};

// NOTE: For webhook handling, Express needs the raw body, not the JSON parsed body.
// You'll need a specific middleware for the webhook route *before* express.json().
// Example: app.post('/api/payment/webhook', express.raw({type: 'application/json'}), handleWebhook);
// And then use express.json() for other routes: app.use(express.json());
