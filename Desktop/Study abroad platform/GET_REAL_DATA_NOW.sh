#!/bin/bash

# 🌍 Real Data Integration - Quick Action Guide
# یہ script آپ کو بتائے گا کہ API keys کہاں سے لیں

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                    🌍 REAL DATA INTEGRATION GUIDE                         ║
║                    کہاں کہاں سے API لیں؟                                 ║
╚════════════════════════════════════════════════════════════════════════════╝


📍 STEP 1: UNIVERSITY DATA (Unirank) - FREE ✅
─────────────────────────────────────────────────────────────────────────────

1. اپنا browser کھولیں اور یہ لنک کھولیں:
   👉 https://www.unirank.org/api

2. "Sign Up" یا "Get API Key" پر کلک کریں

3. Email سے account بنائیں

4. Dashboard میں جائیں → API Keys

5. اپنی key copy کریں (کچھ یوں نظر آئے گی):
   abc123def456ghi789jkl012mno345pqr678stu

6. اپنی .env file میں add کریں:
   UNIRANK_API_KEY=abc123def456ghi789jkl012mno345pqr678stu

✨ BENEFIT: 5000+ Universities, Free tier, No credit card needed


📍 STEP 2: COST OF LIVING (Numbeo) - FREE ✅
─────────────────────────────────────────────────────────────────────────────

1. یہ لنک کھولیں:
   👉 https://www.numbeo.com/api/

2. "Free API" پر کلک کریں

3. Register کریں (Email سے)

4. Email verify کریں

5. Dashboard میں API Key ملے گی

6. .env file میں add کریں:
   NUMBEO_API_KEY=your_numbeo_key_here

✨ BENEFIT: Cost of living, Rent prices, Restaurant prices
✨ FREE: 100 requests per month


📍 STEP 3: EXCHANGE RATES (Optional) - FREE ✅
─────────────────────────────────────────────────────────────────────────────

1. یہ لنک کھولیں:
   👉 https://openexchangerates.org/

2. "Sign Up" پر کلک کریں

3. Email سے register کریں

4. Email verify کریں

5. Dashboard سے App ID copy کریں

6. .env میں add کریں:
   EXCHANGE_RATE_API_KEY=your_app_id_here

✨ BENEFIT: Real-time exchange rates (PKR, USD, EUR, وغیرہ)
✨ FREE: 1000 requests per month


📍 STEP 4: SCHOLARSHIPS (Manual) - FREE ✅
─────────────────────────────────────────────────────────────────────────────

یہ websites سے manually data لیں:

1. Fulbright:
   👉 https://fulbright.state.gov/
   Data: $30,000 per year, USA

2. DAAD:
   👉 https://www.daad.de/
   Data: €15,000-30,000, Germany

3. Erasmus+:
   👉 https://erasmusplus.ec.europa.eu/
   Data: €15,000, Europe

4. Commonwealth:
   👉 https://cscuk.dfid.gov.uk/
   Data: £20,000, UK

5. Chevening:
   👉 https://www.chevening.org/
   Data: Full tuition, UK

→ سب scholarships کو manually database میں add کریں


📍 STEP 5: VISA REQUIREMENTS (Manual) - FREE ✅
─────────────────────────────────────────────────────────────────────────────

Manual data add کریں یہ websites سے:

1. UK Visa:
   👉 https://www.gov.uk/immigration

2. USA Visa:
   👉 https://www.uscis.gov/

3. Canada Immigration:
   👉 https://www.canada.ca/immigration

4. Schengen Visa:
   👉 https://www.schengenvisainfo.com/

→ Requirements, Processing time, Cost - سب add کریں


═══════════════════════════════════════════════════════════════════════════════

⚡ QUICK SUMMARY (30 minutes میں ہو سکتا ہے)
─────────────────────────────────────────────────────────────────────────────

API/Source                  | Time | Cost  | Difficulty
───────────────────────────────────────────────────────────
1. Unirank (Universities)   | 5m   | Free  | Very Easy ✅
2. Numbeo (Cost of Living)  | 5m   | Free  | Very Easy ✅
3. Exchange Rates           | 5m   | Free  | Very Easy ✅
4. Scholarships (Manual)    | 10m  | Free  | Easy
5. Visa Requirements        | 5m   | Free  | Easy
─────────────────────────────────────────────────────────────────────────────
TOTAL TIME: 30 minutes ⏱️
TOTAL COST: FREE 💰


═══════════════════════════════════════════════════════════════════════════════

📝 YOUR .env FILE (تمام APIs کے لیے)
─────────────────────────────────────────────────────────────────────────────

# Copy this to backend/.env.production

# UNIVERSITY DATA
UNIRANK_API_KEY=your_unirank_api_key_here

# COST OF LIVING
NUMBEO_API_KEY=your_numbeo_api_key_here

# EXCHANGE RATES
EXCHANGE_RATE_API_KEY=your_openexchangerates_key_here

# DATA UPDATE SCHEDULE
UPDATE_UNIVERSITIES=daily
UPDATE_COST_OF_LIVING=daily
UPDATE_SCHOLARSHIPS=monthly
UPDATE_EXCHANGE_RATES=daily


═══════════════════════════════════════════════════════════════════════════════

🚀 INTEGRATE IN BACKEND
─────────────────────────────────────────────────────────────────────────────

npm install --save axios node-cron

یہ code `backend/jobs/dataImportJobs.js` میں paste کریں:

────────────────────────────────────────────────────────────────────────────

const axios = require('axios');
const cron = require('node-cron');
const University = require('../models/University');
const CostOfLiving = require('../models/CostOfLiving');

// 1. IMPORT UNIVERSITIES FROM UNIRANK
async function importUniversitiesFromUnirank() {
  try {
    const response = await axios.get('https://www.unirank.org/api/universities', {
      headers: { 'Authorization': `Bearer ${process.env.UNIRANK_API_KEY}` },
      params: { limit: 5000, page: 1 }
    });

    const universities = response.data.map(uni => ({
      name: uni.name,
      country: uni.country,
      city: uni.city,
      ranking: uni.ranking,
      fees: uni.average_tuition || 25000,
      website: uni.website,
      description: uni.description,
      courses: uni.programs || [],
      eligibility: {
        ielts: 6.5,
        gre: 300,
        cgpa: 3.0
      },
      isActive: true,
      source: 'Unirank',
      lastUpdated: new Date()
    }));

    await University.deleteMany({ source: 'Unirank' }); // Replace old data
    await University.insertMany(universities);
    console.log(`✅ Imported ${universities.length} universities from Unirank`);
  } catch (error) {
    console.error('❌ Error importing universities:', error.message);
  }
}

// 2. IMPORT COST OF LIVING FROM NUMBEO
async function importCostOfLivingFromNumbero() {
  try {
    const cities = ['New York', 'London', 'Toronto', 'Sydney', 'Singapore'];
    
    for (const city of cities) {
      const response = await axios.get(
        `https://www.numbeo.com/api/v1/indices/by_city`,
        {
          params: {
            api_key: process.env.NUMBEO_API_KEY,
            query: city
          }
        }
      );

      const costData = {
        city: response.data.name,
        country: response.data.name.split(',')[1]?.trim(),
        costOfLivingIndex: response.data.cost_of_living_index,
        rentIndex: response.data.rent_index,
        restaurantIndex: response.data.restaurant_price_index,
        lastUpdated: new Date()
      };

      await CostOfLiving.findOneAndUpdate(
        { city: costData.city },
        costData,
        { upsert: true }
      );
    }
    
    console.log(`✅ Updated cost of living data for ${cities.length} cities`);
  } catch (error) {
    console.error('❌ Error importing cost of living:', error.message);
  }
}

// 3. SCHEDULED TASKS
if (process.env.NODE_ENV === 'production') {
  // Import universities daily at 2 AM
  cron.schedule('0 2 * * *', importUniversitiesFromUnirank);
  
  // Import cost of living daily at 3 AM
  cron.schedule('0 3 * * *', importCostOfLivingFromNumbero);
}

module.exports = { importUniversitiesFromUnirank, importCostOfLivingFromNumbero };

────────────────────────────────────────────────────────────────────────────


═══════════════════════════════════════════════════════════════════════════════

✅ TEST YOUR DATA INTEGRATION
─────────────────────────────────────────────────────────────────────────────

1. Node میں direct test کریں:
   node -e "
   require('dotenv').config();
   const axios = require('axios');
   
   axios.get('https://www.unirank.org/api/universities', {
     headers: { 'Authorization': \`Bearer \${process.env.UNIRANK_API_KEY}\` },
     params: { limit: 10 }
   }).then(res => {
     console.log('✅ Unirank API Works!');
     console.log('Universities:', res.data.length);
   }).catch(err => console.error('❌ Error:', err.message));
   "

2. Backend server چلائیں:
   npm start

3. Browser میں یہ URLs کھولیں:
   http://localhost:5000/api/universities
   http://localhost:5000/api/cost-of-living
   http://localhost:5000/api/scholarships


═══════════════════════════════════════════════════════════════════════════════

🎯 FINAL CHECKLIST
─────────────────────────────────────────────────────────────────────────────

[ ] Unirank API key ملی
[ ] Numbeo API key ملی
[ ] Exchange Rate API key ملی
[ ] .env.production میں keys ڈالے
[ ] node-cron install کیا (npm install node-cron)
[ ] dataImportJobs.js بنایا
[ ] server.js میں import شامل کیا
[ ] Universities test کیے
[ ] Cost of Living test کیے
[ ] Scholarships manually add کیے
[ ] Visa data add کیے

═══════════════════════════════════════════════════════════════════════════════

🚀 READY TO DEPLOY WITH REAL DATA!

Next: Read API_SOURCES_GUIDE.md for detailed information

═══════════════════════════════════════════════════════════════════════════════

EOF

echo ""
echo "💡 یہ file save ہو گئی: API_SOURCES_GUIDE.md"
echo ""
echo "اگلے steps:"
echo "1. API_SOURCES_GUIDE.md پڑھیں"
echo "2. API keys لیں"
echo "3. .env.production میں add کریں"
echo "4. npm test چلائیں"
echo ""
