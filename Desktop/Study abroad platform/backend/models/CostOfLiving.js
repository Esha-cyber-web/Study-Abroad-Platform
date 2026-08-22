// backend/models/CostOfLiving.js
const mongoose = require('mongoose');

const costOfLivingSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },
  costOfLivingIndex: Number,  // 100 = baseline
  rentIndex: Number,
  restaurantIndex: Number,
  
  prices: {
    avgRent: Number,           // $ per month
    avgGroceries: Number,      // $ per week
    avgMeal: Number,           // $ per meal
    avgTransport: Number,      // $ per month
    avgMobilePhone: Number     // $ per month
  },

  studentCostPerMonth: Number,
  source: { type: String, default: 'Numbeo' },
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('CostOfLiving', costOfLivingSchema);
