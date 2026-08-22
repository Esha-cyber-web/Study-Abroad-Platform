const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  // Basic Info
  name:                { type: String, required: true, index: true },
  provider:            { type: String, required: true, index: true },
  country:             { type: String, required: true, index: true },
  university:          { type: String },
  
  // Financial
  amount:              { type: Number, required: true },
  currency:            { type: String, default: 'USD' },
  coverageType:        { type: String, enum: ['Full Tuition', 'Partial Tuition', 'Monthly Stipend', 'Living Expenses'], default: 'Full Tuition' },
  
  // Education Level
  level:               { type: [String], enum: ['Bachelor', 'Master', 'PhD', 'Postdoctoral'], default: ['Master'] },
  
  // Requirements (Enhanced)
  requirements: {
    minCGPA:           { type: Number },
    minIELTS:          { type: Number },
    minTOEFL:          { type: Number },
    minGRE:            { type: Number },
    minGMAT:           { type: Number },
    requiredCertificates: [String],
    workExperienceYears: Number
  },
  
  // Legacy field (for backward compatibility)
  eligibilityCriteria: { type: String },
  minCGPA:             { type: Number, default: 0 },
  fieldOfStudy:        { type: String, default: 'Any' },
  
  // New Fields
  eligibleCountries:   [String],
  eligiblePrograms:    [String],
  
  // Timeline
  deadline:            { type: Date },
  applicationYear:     { type: Number },
  awardYear:           { type: Number },
  duration:            { type: String },
  
  // Details
  description:         { type: String },
  website:             { type: String },
  link:                { type: String, default: '' },
  contactEmail:        { type: String },
  applicationLink:     { type: String },
  
  // Metadata
  source:              { type: String, default: 'Manual' },
  competitiveness:     { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  successRate:         { type: Number },
  isActive:            { type: Boolean, default: true },
  lastUpdated:         { type: Date, default: Date.now }
}, { timestamps: true });

// Add index for frequently queried fields
scholarshipSchema.index({ country: 1, deadline: 1 });
scholarshipSchema.index({ provider: 1, isActive: 1 });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
