import express from 'express';
import { discoverJobs } from '../controllers/jobDiscoveryController';

const router = express.Router();

// POST /api/job-discovery/discover
router.post('/discover', discoverJobs);

export default router; 