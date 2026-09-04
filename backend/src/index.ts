import express from 'express';
import cors from 'cors';
import analyticsRoutes from './routes/analytics.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow all
app.use(express.json());

// Routes
app.use('/api/v1/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
