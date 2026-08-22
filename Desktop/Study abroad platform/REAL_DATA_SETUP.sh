#!/bin/bash

# 🚀 COMPLETE REAL DATA INTEGRATION SETUP
# آپ کا Step-by-Step Guide

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                   🌍 REAL DATA INTEGRATION SETUP                          ║
║               تمام APIs کہاں سے لیں - مکمل گائیڈ                       ║
╚════════════════════════════════════════════════════════════════════════════╝

🎯 15 MINUTES میں یہ کریں:
────────────────────────────────────────────────────────────────────────────

✅ STEP 1: UNIRANK API (5000+ Universities)
──────────────────────────────────────────────────────────────────────────

1. Browser میں کھولیں:
   👉 https://www.unirank.org/api

2. اگر signup page نہ آئے تو:
   👉 https://www.unirank.org/

3. "API" یا "Developer" section تلاش کریں

4. "Sign Up" پر کلک کریں

5. اپنی information بھریں:
   • Email: your-email@example.com
   • Password: Strong password
   • First Name: آپ کا نام
   • Last Name: آپ کی family

6. Email verify کریں

7. Dashboard میں جائیں

8. "API Keys" یا "My API" section تلاش کریں

9. API Key copy کریں (کچھ یوں ہوگی):
   abc123xyz789def456ghi

10. اپنی .env.production file میں یہ paste کریں:
    UNIRANK_API_KEY=abc123xyz789def456ghi


✅ STEP 2: NUMBEO API (Cost of Living)
──────────────────────────────────────────────────────────────────────────

1. Browser میں کھولیں:
   👉 https://www.numbeo.com/api/

2. "Sign up" پر کلک کریں

3. Details بھریں:
   • Email
   • Password
   • Name

4. Email verify کریں

5. Logged in ہو جانے کے بعد:
   https://www.numbeo.com/api/mykey.jsp

6. اپنی API key ملے گی

7. Copy کریں اور .env میں add کریں:
   NUMBEO_API_KEY=your_numbeo_key


✅ STEP 3: EXCHANGE RATES (Optional)
──────────────────────────────────────────────────────────────────────────

1. Browser میں:
   👉 https://openexchangerates.org/

2. "Free Account" یا "Sign Up" پر کلک کریں

3. Email سے register کریں

4. Email verify کریں

5. Dashboard میں اپنی "App ID" ملے گی

6. Copy اور .env میں paste کریں:
   EXCHANGE_RATE_API_KEY=your_app_id


═══════════════════════════════════════════════════════════════════════════════

📝 YOUR COMPLETE .env.production FILE
──────────────────────────────────────────────────────────────────────────────

Copy یہ تمام کچھ اپنی backend/.env.production میں:

─────────────────────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=production

# MONGODB DATABASE
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/StudyAbroad

# JWT SECURITY
JWT_SECRET=generate_random_32_chars_with_openssl
JWT_EXPIRY=7d

# EMAIL CONFIGURATION
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_gmail_app_password

# GOOGLE OAUTH
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# GITHUB OAUTH
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret

# OPENAI
OPENAI_API_KEY=sk-proj-your-openai-key

# ========== REAL DATA APIs ==========

# UNIVERSITY DATA
UNIRANK_API_KEY=your_unirank_key_here

# COST OF LIVING
NUMBEO_API_KEY=your_numbeo_key_here

# EXCHANGE RATES
EXCHANGE_RATE_API_KEY=your_openexchangerates_key_here

# DATA IMPORT SCHEDULE
UPDATE_UNIVERSITIES=daily
UPDATE_COST_OF_LIVING=daily
UPDATE_SCHOLARSHIPS=manual
UPDATE_EXCHANGE_RATES=daily

# FRONTEND URL
CLIENT_URL=http://localhost:5173

─────────────────────────────────────────────────────────────────────────────


═══════════════════════════════════════════════════════════════════════════════

🔧 SETUP INSTRUCTIONS (Backend میں)
──────────────────────────────────────────────────────────────────────────────

1. Required packages install کریں:

   cd backend
   npm install axios node-cron

2. Models already بنے ہوئے ہیں:
   ✅ backend/models/CostOfLiving.js
   ✅ backend/models/Scholarship.js
   ✅ backend/models/VisaRequirement.js

3. Routes already بنے ہوئے ہیں:
   ✅ backend/routes/realDataRoutes.js

4. Server.js پہلے سے updated ہے
   ✅ Routes added: /api/data/*


═══════════════════════════════════════════════════════════════════════════════

🧪 TEST YOUR SETUP
──────────────────────────────────────────────────────────────────────────────

1. Node میں Unirank test کریں:
   
   node -e "
   require('dotenv').config({ path: '.env.production' });
   const axios = require('axios');
   
   axios.get('https://www.unirank.org/api/universities', {
     headers: { 'Authorization': \`Bearer \${process.env.UNIRANK_API_KEY}\` },
     params: { limit: 5 }
   })
   .then(res => console.log('✅ Success! Got', res.data.length, 'universities'))
   .catch(err => console.error('❌ Error:', err.message));
   "

2. Server چلائیں اور یہ URLs test کریں:
   
   curl http://localhost:5000/api/data/universities-with-data
   curl http://localhost:5000/api/data/cost-of-living/London
   curl http://localhost:5000/api/data/scholarships?country=USA
   curl http://localhost:5000/api/data/visa-requirements?fromCountry=Pakistan&toCountry=USA


═══════════════════════════════════════════════════════════════════════════════

📊 AVAILABLE API ENDPOINTS
──────────────────────────────────────────────────────────────────────────────

GET    /api/data/universities-with-data
       └─ Universities کو real data کے ساتھ (scholarships, visas, cost of living)
       └─ Query: ?country=USA&minPrice=10000&maxPrice=50000

GET    /api/data/cost-of-living/:city
       └─ Cost of living data کسی شہر کے لیے
       └─ Example: /api/data/cost-of-living/London

GET    /api/data/scholarships
       └─ سب scholarships
       └─ Query: ?country=USA&minAmount=5000&maxAmount=30000&provider=Fulbright

GET    /api/data/scholarships/:id
       └─ کسی specific scholarship کی details

GET    /api/data/visa-requirements
       └─ Visa requirements
       └─ Query: ?fromCountry=Pakistan&toCountry=USA

POST   /api/data/admin/import-scholarships
       └─ Scholarships manually import کریں

POST   /api/data/admin/import-visa-requirements
       └─ Visa requirements manually import کریں


═══════════════════════════════════════════════════════════════════════════════

✨ AUTOMATIC DAILY UPDATES (Optional)
──────────────────────────────────────────────────────────────────────────────

اگر آپ چاہتے ہیں کہ data automatically update ہو:

backend/jobs/dataImportJobs.js میں یہ code add کریں:

─────────────────────────────────────────────────────────────────────────────

const cron = require('node-cron');
const axios = require('axios');
const University = require('../models/University');
const CostOfLiving = require('../models/CostOfLiving');

// Import universities daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('📥 Updating universities from Unirank...');
  try {
    const response = await axios.get('https://www.unirank.org/api/universities', {
      headers: { 'Authorization': \`Bearer \${process.env.UNIRANK_API_KEY}\` },
      params: { limit: 5000 }
    });

    const universities = response.data.map(uni => ({
      name: uni.name,
      country: uni.country,
      city: uni.city,
      ranking: uni.ranking,
      fees: uni.average_tuition || 25000,
      website: uni.website,
      courses: uni.programs || [],
      isActive: true,
      source: 'Unirank',
      lastUpdated: new Date()
    }));

    await University.deleteMany({ source: 'Unirank' });
    await University.insertMany(universities);
    console.log(`✅ Updated ${universities.length} universities`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
});

─────────────────────────────────────────────────────────────────────────────

پھر اپنے server.js میں add کریں:

  require('./jobs/dataImportJobs');


═══════════════════════════════════════════════════════════════════════════════

💡 TROUBLESHOOTING
──────────────────────────────────────────────────────────────────────────────

Problem: "API key not working"
Solution:
  1. Key کو copy کرتے وقت spaces نہ ہوں
  2. Key کو .env file میں بغیر quotes کے add کریں
  3. Server restart کریں

Problem: "401 Unauthorized"
Solution:
  1. API key expiry check کریں
  2. Account billing enabled ہے یا نہیں
  3. صحیح API key استعمال ہو رہا ہے

Problem: "Rate limit exceeded"
Solution:
  1. اگر free tier استعمال کر رہے ہیں تو monthly limit check کریں
  2. Requests کو cache کریں
  3. Paid tier upgrade کریں


═══════════════════════════════════════════════════════════════════════════════

📋 SCHOLARSHIPS & VISA DATA (Manual)
──────────────────────────────────────────────────────────────────────────────

Scholarships اور Visa requirements automatically نہیں ملتی ہیں۔
آپ کو manually add کرنے ہیں۔

Popular Scholarships (خود add کریں):

1. Fulbright Program
   Amount: $30,000 per year
   Country: USA
   Website: https://fulbright.state.gov/

2. DAAD Scholarships
   Amount: €934 per month
   Country: Germany
   Website: https://www.daad.de/

3. Erasmus+ Scholarships
   Amount: €15,000 per year
   Country: Europe (EU countries)
   Website: https://erasmusplus.ec.europa.eu/

4. Commonwealth Scholarships
   Amount: £20,000+
   Country: UK
   Website: https://cscuk.dfid.gov.uk/

5. Chevening Scholarships
   Amount: Full tuition + living expenses
   Country: UK
   Website: https://www.chevening.org/

Quick Add کریں curl سے:

curl -X POST http://localhost:5000/api/data/admin/import-scholarships \
  -H "Content-Type: application/json" \
  -d '{
    "scholarships": [
      {
        "name": "Fulbright Scholarship",
        "provider": "US State Department",
        "country": "USA",
        "amount": 30000,
        "deadline": "2025-10-31"
      }
    ]
  }'


═══════════════════════════════════════════════════════════════════════════════

✅ FINAL CHECKLIST
──────────────────────────────────────────────────────────────────────────────

[ ] Unirank API key ملی
[ ] Numbeo API key ملی
[ ] Exchange Rate API key ملی (optional)
[ ] .env.production میں keys ڈالے
[ ] npm install axios node-cron کیا
[ ] backend/models میں تینوں models ہیں
[ ] backend/routes میں realDataRoutes ہے
[ ] server.js میں routes add ہے
[ ] npm start کیا
[ ] http://localhost:5000/api/data/universities-with-data test کیا
[ ] Scholarships manually add کیے
[ ] Visa data add کیا
[ ] Load test چلایا
[ ] Deployment کے لیے تیار!

═══════════════════════════════════════════════════════════════════════════════

🎉 READY TO DEPLOY WITH REAL DATA!

Next Commands:

  npm test                    # Test everything
  npm start                   # Start server
  k6 run k6_load_test.js     # Load test
  bash deploy.sh              # Deploy to production

═══════════════════════════════════════════════════════════════════════════════

EOF

echo ""
echo "✨ Complete guide saved!"
echo ""
