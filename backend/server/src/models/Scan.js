import mongoose from 'mongoose';

const trendItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    publishedAt: { type: String, default: '' },
    trending: { type: Boolean, default: false },
    viral: { type: Boolean, default: false },
    emerging: { type: Boolean, default: false },
    whyTrending: { type: String, default: '' },
    popularityScore: { type: Number, default: 0, min: 0, max: 100 },
    sources: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    contentPotential: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  },
  { _id: false }
);

const scanSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true, index: true },
    results: { type: [trendItemSchema], default: [] },
    filter: { type: String, enum: ['all', 'trending', 'viral', 'emerging', 'new'], default: 'all' },
  },
  { timestamps: true, versionKey: false }
);

scanSchema.index({ createdAt: -1 });

export default mongoose.model('Scan', scanSchema, 'scans');
