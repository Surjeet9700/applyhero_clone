import React, { useState } from 'react';
import { api } from '../services/api'; // Import the API service
import { useAuth } from '../contexts/AuthContext'; // Import auth context

// Define a simple pricing plan structure
interface PricingPlan {
  id: string; // Your internal ID for the plan
  stripePriceId: string; // The actual Stripe Price ID
  name: string;
  price: string;
  frequency: string;
  features: string[];
}

// Example pricing plans (replace with your actual plans and Stripe Price IDs)
const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    stripePriceId: 'price_12345', // <<< REPLACE with your Stripe Price ID
    name: 'Basic',
    price: '$0',
    frequency: 'per month',
    features: [
      'Limited auto-applies',
      'Basic AI generation',
      'Job tracking',
    ],
  },
  {
    id: 'pro',
    stripePriceId: 'price_67890', // <<< REPLACE with your Stripe Price ID
    name: 'Pro',
    price: '$29',
    frequency: 'per month',
    features: [
      'Unlimited auto-applies',
      'Advanced AI generation',
      'Priority support',
      'Resume hosting',
      'Analytics dashboard',
    ],
  },
];


const PricingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle initiating checkout
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      alert('Please log in to subscribe.');
      // You might want to use react-router-dom's navigate here
      // navigate('/login');
      return;
    }

    setIsCreatingSession(true);
    setError(null);

    try {
      const response = await api.payment.createCheckoutSession(priceId);
      if (response && response.url) {
        // Redirect the user to the Stripe checkout page
        window.location.href = response.url;
      } else {
        setError('Failed to get checkout URL.');
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  // You might want to display the user's current subscription status here
  // This would require fetching the user's profile which includes subscription info
  // const userProfile = user?.user_metadata?.profile; // Assuming profile is stored here
  // const currentSubscriptionStatus = userProfile?.subscriptionStatus;
  // const currentPlan = pricingPlans.find(p => p.stripePriceId === userProfile?.stripePriceId);


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h1>

      {/* Display current subscription status if available */}
      {/* {user && userProfile && (
          <div className="text-center mb-8">
              {currentSubscriptionStatus === 'active' ? (
                  <p className="text-lg text-green-600 font-semibold">
                      You are currently subscribed to the {currentPlan?.name || 'Unknown'} plan.
                  </p>
              ) : currentSubscriptionStatus ? (
                   <p className="text-lg text-yellow-600 font-semibold">
                      Your subscription status is: {currentSubscriptionStatus}.
                   </p>
              ) : (
                   <p className="text-lg text-gray-600">You do not currently have an active subscription.</p>
              )}
          </div>
      )} */}


      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {pricingPlans.map(plan => (
          <div key={plan.id} className="border rounded-lg shadow-lg p-6 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">{plan.name}</h2>
            <p className="text-4xl font-bold mb-4">{plan.price}<span className="text-base font-normal text-gray-600">/{plan.frequency}</span></p>
            <ul className="flex-grow mb-6 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  {feature}
                </li>
              ))}
            </ul>
            {/* Disable button if loading or if user is already on this plan */}
            <button
              onClick={() => handleCheckout(plan.stripePriceId)}
              className={`mt-auto w-full py-3 rounded-md text-white font-semibold transition duration-300
                ${isCreatingSession ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                ${plan.id === 'basic' ? 'bg-gray-500 hover:bg-gray-600' : ''}
              `}
              disabled={isCreatingSession || plan.id === 'basic'} // Basic plan is free, no checkout needed
            >
              {plan.id === 'basic' ? 'Current Plan' : isCreatingSession ? 'Processing...' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
       <p className="text-center text-sm text-gray-500 mt-8">
           Note: This is a demo. Replace Stripe Price IDs and plan details with your actual configuration.
           Webhook handling is required on your server to update subscription statuses reliably.
       </p>
    </div>
  );
};

export default PricingPage;
