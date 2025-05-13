import { Request, Response } from 'express';
import { discoverJobsForUser } from '../utils/jobDiscoveryService';

export const discoverJobs = async (req: Request, res: Response) => {
  try {
    const { userId, filters } = req.body;
    if (!userId || !filters) {
      return res.status(400).json({ message: 'userId and filters are required.' });
    }
    await discoverJobsForUser(userId, filters);
    res.json({ message: 'Job discovery complete.' });
  } catch (error: any) {
    console.error('Job discovery error:', error);
    res.status(500).json({ message: 'Job discovery failed.', error: error.message });
  }
}; 