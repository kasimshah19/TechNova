import mongoose from 'mongoose';

const codeSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true },
    language: { type: String, default: '' },
    result: {
      code: String,
      language: String,
      explanation: String,
    },
    model: { type: String, default: 'gemini' },
    fallback: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

codeSchema.index({ createdAt: -1 });

export default mongoose.model('Code', codeSchema, 'codes');
