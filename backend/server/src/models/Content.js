import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, trim: true },
    summary: { type: String, default: '' },
    platform: {
      type: String,
      required: true,
      enum: ['Facebook', 'Instagram', 'LinkedIn', 'Pinterest', 'Threads', 'Twitter/X', 'Reddit', 'Blog'],
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    postingTime: {
      bestTime: String,
      bestDay: String,
      expectedEngagement: { type: String, enum: ['High', 'Medium', 'Low'] },
      potentialReach: { type: String, enum: ['High', 'Medium', 'Low'] },
      reason: String,
    },
  },
  { timestamps: true, versionKey: false }
);

contentSchema.index({ createdAt: -1 });

export default mongoose.model('Content', contentSchema, 'contents');
