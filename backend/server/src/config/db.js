import mongoose from 'mongoose';

let cached = { conn: null, promise: null };

/**
 * Connect to MongoDB Atlas. Reuses the connection across serverless invocations.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env (see .env.example).');
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      dbName: process.env.MONGODB_DB || 'tech_nova',
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose.connect(uri, opts).then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
    console.log('[mongo] connected to', cached.conn.connection.host);
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error('[mongo] connection failed:', err.message);
    throw err;
  }
}

export async function gracefulShutdown() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
