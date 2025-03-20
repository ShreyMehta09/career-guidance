import mongoose from 'mongoose';

// MongoDB connection URI - use environment variable in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career-guidance';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache the mongodb connection
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      dbName: 'career-guidance',
      autoCreate: true,
      connectTimeoutMS: 10000, // 10 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds
      // Use IPv4 explicitly
      family: 4,
    };

    console.log('Connecting to MongoDB at:', MONGODB_URI);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        console.error('Please ensure MongoDB is running and accessible at:', MONGODB_URI);
        console.error('Try starting MongoDB server or updating your connection string in .env.local');
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on error to allow retrying
    throw error;
  }
}

export default connectDB; 