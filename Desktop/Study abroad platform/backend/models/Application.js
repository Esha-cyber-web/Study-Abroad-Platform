const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  docType:    { type: String, required: true },
  filename:   { type: String, required: true },
  url:        { type: String, required: true },
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
});

// Status history schema tracking timeline with dates
const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  program:      { type: String, required: true },
  startDate:    { type: Date },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'],
    default: 'draft',
  },
  statusHistory: [statusHistorySchema], // Timeline dates tracking array
  documents:      [documentSchema],
  notes:          { type: String, default: '' },
  internalNotes:  { type: String, default: '' },
  assignedCounselor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  personalInfo: {
    phone:       String,
    address:     String,
    dob:         Date,
    nationality: String,
  },
  academicInfo: {
    cgpa:       Number,
    ielts:      Number,
    gre:        Number,
    lastDegree: String,
    institution: String,
  },
}, { timestamps: true });

// FIXED: Clean Mongoose Middleware without broken next() invocation
applicationSchema.pre('save', function () {
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory.push({
      status: this.status || 'submitted',
      updatedAt: new Date(),
    });
  }
});

module.exports = mongoose.model('Application', applicationSchema);