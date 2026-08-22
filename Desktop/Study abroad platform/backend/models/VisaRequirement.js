// backend/models/VisaRequirement.js
const mongoose = require('mongoose');

const visaRequirementSchema = new mongoose.Schema({
  fromCountry: {
    type: String,
    required: true,
    index: true
  },
  toCountry: {
    type: String,
    required: true,
    index: true
  },
  visaType: {
    type: String,
    required: true,
    enum: ['Student Visa', 'Work Visa', 'Tourist Visa', 'Transit Visa']
  },

  // Processing details
  processingTimeMin:   { type: Number },     // days
  processingTimeMax:   { type: Number },     // days
  cost:                { type: Number },     // in USD
  validityPeriod:      { type: String },     // eg: "2 years"

  // Requirements
  requirements:        [String],
  documents:           [String],

  // Financial
  proofOfFundsAmount:  { type: Number },
  tuitionCoverageRequired: { type: Boolean, default: false },
  scholarshipAccepted: { type: Boolean, default: true },

  // Restrictions
  workRestrictionsPerWeek: { type: Number }, // hours per week
  allowedDuringStudies: { type: Boolean, default: true },
  postStudyWorkVisa: {
    available:         { type: Boolean, default: false },
    durationMonths:    { type: Number }
  },

  // Links
  officialWebsite:     { type: String },
  applicationLink:     { type: String },
  embassy:             { type: String },

  // Details
  difficultyLevel: {
    type: String,
    enum: ['Easy', 'Medium', 'Difficult'],
    default: 'Medium'
  },
  description:         { type: String },
  tips:                [String],

  // Metadata
  source:              { type: String, default: 'Manual' },
  lastUpdated:         { type: Date, default: Date.now },
  isActive:            { type: Boolean, default: true }
}, { timestamps: true });

// Add indexes
visaRequirementSchema.index({ fromCountry: 1, toCountry: 1, visaType: 1 });

module.exports = mongoose.model('VisaRequirement', visaRequirementSchema);
