import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the UserProfile document
export interface IUserProfile extends Document {
  userId: string; // Supabase Auth user ID
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  stripeCustomerId?: string; // Add Stripe Customer ID
  subscriptionStatus?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'paused' | 'trialing' | 'unpaid' | null; // Add Subscription Status
  stripePriceId?: string | null; // Add Stripe Price ID (plan)
  currentPeriodEnd?: Date | null; // Add Subscription Period End
}

// Define the Mongoose schema for UserProfile
const UserProfileSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true }, // Link to Supabase Auth user ID
  email: { type: String, required: true, unique: true },
  name: { type: String },
  isAdmin: { type: Boolean, default: false },
  stripeCustomerId: { type: String, unique: true, sparse: true }, // Allow nulls, ensure uniqueness if present
  subscriptionStatus: { type: String, enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid', null], default: null },
  stripePriceId: { type: String, default: null },
  currentPeriodEnd: { type: Date, default: null },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create and export the Mongoose model
const UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

export default UserProfile;
