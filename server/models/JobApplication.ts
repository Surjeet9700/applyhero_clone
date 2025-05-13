import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for a Job Application document
export interface IJobApplication extends Document {
  userId: string; // Supabase user ID
  title: string;
  company: string;
  jobUrl?: string; // URL of the job posting
  applicationDate: Date; // Date the application was logged
  status: 'Applied' | 'Interviewing' | 'Rejected' | 'Offer' | 'Other'; // Application status
  success: boolean; // Whether the auto-apply attempt was successful (from extension)
  details?: string; // Details about the application attempt (e.g., error message from extension)
  coverLetterContent?: string; // Store the generated cover letter content
  resumeUrlUsed?: string; // Store the URL of the resume used
  notes?: string; // User's personal notes
  createdAt: Date; // Timestamp for document creation
  updatedAt: Date; // Timestamp for document update
}

// Define the Mongoose schema for Job Application
const JobApplicationSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true }, // Index for faster lookup by user
  title: { type: String, required: true },
  company: { type: String, required: true },
  jobUrl: { type: String },
  applicationDate: { type: Date, default: Date.now }, // Default to current date
  status: {
    type: String,
    enum: ['Applied', 'Interviewing', 'Rejected', 'Offer', 'Other'],
    default: 'Applied', // Default status
  },
  success: { type: Boolean, required: true }, // Success status from the extension attempt
  details: { type: String },
  coverLetterContent: { type: String },
  resumeUrlUsed: { type: String },
  notes: { type: String },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Create and export the Mongoose model
const JobApplication = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

// --- Job Discovery Model ---
export interface IJobDiscovery extends Document {
  userId: string; // Supabase user ID
  title: string;
  company: string;
  jobUrl: string;
  source: string; // e.g., 'LinkedIn', 'Indeed', etc.
  location?: string;
  salary?: string;
  description?: string;
  filters?: Record<string, any>; // The filters used for this search
  discoveredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobDiscoverySchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  jobUrl: { type: String, required: true },
  source: { type: String, required: true },
  location: { type: String },
  salary: { type: String },
  description: { type: String },
  filters: { type: Schema.Types.Mixed },
  discoveredAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export const JobDiscovery = mongoose.model<IJobDiscovery>('JobDiscovery', JobDiscoverySchema);

export default JobApplication;
