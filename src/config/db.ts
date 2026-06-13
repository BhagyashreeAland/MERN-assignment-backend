import dns from 'dns';
import mongoose from 'mongoose';

// Helps Node.js DNS resolution on some Windows/network setups
dns.setDefaultResultOrder('ipv4first');

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-generator';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
