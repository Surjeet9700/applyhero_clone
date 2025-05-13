import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db'; // Import the DB connection function
import authRoutes from './routes/auth'; // Import auth routes
import jobRoutes from './routes/jobs'; // Import job routes
import applyRoutes from './routes/apply'; // Import apply routes
import adminRoutes from './routes/admin'; // Import admin routes
import paymentRoutes from './routes/payment'; // Import new payment routes
import jobDiscoveryRoutes from './routes/jobDiscovery';
// import aiRoutes from './routes/ai'; // aiController is now used internally by applyController

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3001; // Use port 3001 for backend

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend
  credentials: true,
}));

// IMPORTANT: Stripe webhook needs the raw body, so we add a specific middleware for it
// BEFORE the general express.json() middleware.
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), handleWebhook);

// General middleware for parsing JSON bodies (excluding the webhook route)
app.use(express.json());


// Basic root route
app.get('/', (req, res) => {
  res.send('AutoApply AI Backend is running!');
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes); // Mount job routes (now only has /applied)
app.use('/api/apply', applyRoutes); // Mount apply routes (/generate, /log)
app.use('/api/admin', adminRoutes); // Mount admin routes
app.use('/api/payment', paymentRoutes); // Mount new payment routes
app.use('/api/job-discovery', jobDiscoveryRoutes);
// app.use('/api/ai', aiRoutes); // aiRoutes are not needed as aiController is used internally

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
