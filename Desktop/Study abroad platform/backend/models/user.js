const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  password:         { type: String }, //optional
  googleId:         { type: String },
  githubId:         { type: String },
  profilePicture:   { type: String, default: '' },
  phone:            { type: String, default: '' },
  country:          { type: String, default: '' },
  role:             { type: String, enum: ['student', 'counselor', 'admin'], default: 'student' },
  isBanned:         { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  assignedCounselor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  favorites:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'University' }],
  cgpa:             { type: Number, default: null },
  ielts:            { type: Number, default: null },
  budget:           { type: Number, default: null },
  preferredCountry: { type: String, default: '' },
}, { timestamps: true });

// FIXED: Prevents "Cannot overwrite 'User' model once compiled" crash on hot-reload/casing mismatches
module.exports = mongoose.models.User || mongoose.model('User', userSchema);

