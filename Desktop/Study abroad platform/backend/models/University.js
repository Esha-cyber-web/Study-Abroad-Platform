const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, index: true },
  city: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  image: { type: String, default: '' },
  ranking: { type: Number, min: 1, index: true },
  description: { type: String, default: '' },
  programs: [{ type: String, trim: true }],
  website: { type: String, default: '' },
  courses: [{ type: String, trim: true }],
  fees: { type: Number, required: true, min: 0, index: true },
  currency: { type: String, default: 'USD', uppercase: true },
  eligibility: {
    min_cgpa: { type: Number, default: 0 },
    ielts: { type: Number, default: 0 },
    gre: { type: Number, default: 0 },
    entry_test: { type: String, default: 'None' },
  },
  visa_time: { type: String, default: '' },
  applicationDeadline: { type: Date, default: null },
  scholarships: {
    available: { type: Boolean, default: false },
    details: { type: String, default: '' },
    coverage: { type: String, default: '' },
  },
  living_cost: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

universitySchema.index({ name: 'text', country: 'text', city: 'text', description: 'text' });

module.exports = mongoose.model('University', universitySchema);