import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    alt: { type: String, default: '' },
    model: { type: String, default: 'gemini' },
    fallback: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

imageSchema.index({ createdAt: -1 });

export default mongoose.model('Image', imageSchema, 'images');
