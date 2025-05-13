import mongoose from 'mongoose';
import { JobDiscovery } from '../models/JobApplication';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '', { useNewUrlParser: true, useUnifiedTopology: true });

/**
 * Discover jobs for a user based on filters.
 * @param {string} userId - The user's ID.
 * @param {object} filters - The search filters (keywords, location, etc.).
 * @returns {Promise<void>}
 */
export async function discoverJobsForUser(userId: string, filters: Record<string, any>) {
  // TODO: Replace this mock data with real scraping/API logic
  const mockJobs = [
    {
      title: 'Software Engineer',
      company: 'LinkedIn',
      jobUrl: 'https://www.linkedin.com/jobs/view/123',
      source: 'LinkedIn',
      location: 'Remote',
      salary: '$120,000',
      description: 'Work on scalable systems.',
      filters,
    },
    {
      title: 'Backend Developer',
      company: 'Indeed',
      jobUrl: 'https://www.indeed.com/viewjob?jk=456',
      source: 'Indeed',
      location: 'San Francisco, CA',
      salary: '$130,000',
      description: 'API and microservices.',
      filters,
    },
    {
      title: 'Full Stack Engineer',
      company: 'ZipRecruiter',
      jobUrl: 'https://www.ziprecruiter.com/jobs/789',
      source: 'ZipRecruiter',
      location: 'New York, NY',
      salary: '$125,000',
      description: 'React and Node.js.',
      filters,
    },
    {
      title: 'Frontend Developer',
      company: 'Glassdoor',
      jobUrl: 'https://www.glassdoor.com/job-listing/101',
      source: 'Glassdoor',
      location: 'Austin, TX',
      salary: '$115,000',
      description: 'UI/UX and JavaScript.',
      filters,
    },
  ];

  for (const job of mockJobs) {
    await JobDiscovery.create({
      userId,
      ...job,
      discoveredAt: new Date(),
    });
  }
}

// If run directly, execute a test discovery
if (require.main === module) {
  (async () => {
    const testUserId = 'test-user-123';
    const testFilters = { keywords: 'engineer', location: 'remote' };
    await discoverJobsForUser(testUserId, testFilters);
    console.log('Mock job discovery complete.');
    process.exit(0);
  })();
} 