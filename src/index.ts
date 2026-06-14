import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import invoiceRoutes from './routes/invoiceRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173','https://api-mern-assignment-frontend.vercel.app'
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Invoice Generator API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
