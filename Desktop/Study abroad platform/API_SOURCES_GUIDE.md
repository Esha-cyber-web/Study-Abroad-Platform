# 🌍 Real Data Integration - API Sources & Setup Guide

## 1️⃣ UNIVERSITY DATA APIs

### Option 1: Unirank API (Best & Free)
**Website:** https://www.unirank.org/api

**Steps to Get API Key:**
1. Go to: https://www.unirank.org/api
2. Click "Sign Up" or "API Documentation"
3. Create account
4. Go to Dashboard → API Keys
5. Copy your API key
6. Add to .env: `UNIRANK_API_KEY=your_key_here`

**What You Get:**
- 5000+ universities worldwide
- Ranking, fees, location, programs
- Free tier available

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_KEY" \
  https://www.unirank.org/api/universities?limit=100&page=1
```

---

### Option 2: QS Rankings API (Paid)
**Website:** https://www.topuniversities.com/api

**Steps:**
1. Go to: https://www.topuniversities.com/api
2. Request API access
3. Pay subscription ($100-500/month)
4. Get API key
5. Add to .env: `QS_API_KEY=your_key_here`

**Features:**
- Official QS rankings
- Most comprehensive data
- Real-time updates

---

### Option 3: Times Higher Education (Paid)
**Website:** https://www.timeshighereducation.com/rankings

**Steps:**
1. Go to: https://www.timeshighereducation.com/world-university-rankings
2. Request institutional access
3. Contact sales team
4. Integrate API

---

### Option 4: Web Scraping (Free but Slower)
If APIs are too expensive, scrap data from:
- https://www.unirank.org/
- https://www.topuniversities.com/
- https://www.timeshighereducation.com/

```javascript
const cheerio = require('cheerio');
const axios = require('axios');

async function scrapeUniversities(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const universities = [];
  
  $('.university-card').each((i, el) => {
    universities.push({
      name: $(el).find('.name').text(),
      country: $(el).find('.country').text(),
      ranking: $(el).find('.rank').text(),
      fees: $(el).find('.fees').text()
    });
  });
  
  return universities;
}
```

---

## 2️⃣ SCHOLARSHIP DATABASES

### Option 1: Fulbright Program
**Website:** https://fulbright.state.gov/

**How to Get Data:**
1. Go to: https://fulbright.state.gov/
2. API: https://api.fulbright.state.gov/ (Limited)
3. Or: Manually add scholarships to database
4. Or: Web scrape from website

**Manual Process:**
```javascript
const scholarships = [
  {
    name: "Fulbright Scholarship",
    amount: 30000,
    country: "USA",
    requirements: "Bachelor's degree, 3.0+ CGPA",
    deadline: "2025-10-31"
  }
];
```

---

### Option 2: Erasmus+ Scholarships (EU)
**Website:** https://erasmusplus.ec.europa.eu/

**Get Data:**
1. Go to: https://erasmusplus.ec.europa.eu/
2. Download: Scholarship list
3. API: Limited, mostly manual updates
4. Add to database quarterly

**Key Info:**
- €15,000-30,000 per year
- For EU/EEA/Turkey students
- Applied Sciences focus

---

### Option 3: Commonwealth Scholarships
**Website:** https://cscuk.dfid.gov.uk/

**Steps:**
1. Go to: https://cscuk.dfid.gov.uk/
2. Browse: Available scholarships
3. Add manually: Name, amount, deadline
4. Update quarterly

---

### Option 4: DAAD (Germany)
**Website:** https://www.daad.de/

**How to Get:**
1. Go to: https://www.daad.de/en/
2. Search: Scholarship database
3. API: Available for institutions
4. Contact: DAAD for institutional API

---

### Option 5: Chevening Scholarships (UK)
**Website:** https://www.chevening.org/

**Steps:**
1. Go to: https://www.chevening.org/
2. Manual entry required
3. Update annually

---

### DIY Approach: Build Your Own List
```javascript
// backend/models/Scholarship.js
const scholarshipSchema = new Schema({
  name: String,
  provider: String,
  country: String,
  amount: Number,
  level: ['Bachelor', 'Master', 'PhD'],
  requirements: {
    minCGPA: Number,
    minIELTS: Number,
    minGRE: Number,
  },
  deadline: Date,
  website: String,
  link: String,
  isActive: Boolean,
});

// Add scholarships manually
db.scholarships.insertMany([
  {
    name: "Fulbright Scholarship",
    provider: "US State Department",
    country: "USA",
    amount: 30000,
    deadline: new Date("2025-10-31"),
    website: "https://fulbright.state.gov/"
  },
  // More scholarships...
]);
```

---

## 3️⃣ COST OF LIVING DATA

### Option 1: Numbeo API (Free & Best)
**Website:** https://www.numbeo.com/api/

**Steps to Get API Key:**
1. Go to: https://www.numbeo.com/api/
2. Click: "Free API"
3. Register: Create free account
4. Copy: API key from dashboard
5. Add to .env: `NUMBEO_API_KEY=your_key_here`

**Free Tier Includes:**
- 100 requests/month
- Cost of living index
- Rent prices
- Restaurant prices

**Paid Tier:**
- $10/month: 10,000 requests
- $50/month: 100,000 requests

**Example Usage:**
```bash
curl "https://www.numbeo.com/api/v1/indices/by_city?api_key=YOUR_KEY&query=New York, USA"
```

**Response:**
```json
{
  "name": "New York, USA",
  "cost_of_living_index": 187.3,
  "rent_index": 226.4,
  "restaurant_price_index": 145.3
}
```

---

### Option 2: Statista (Paid)
**Website:** https://www.statista.com/

**Cost:** $300-1000/month
**Features:** Most comprehensive data

---

### Option 3: Web Scraping (Free)
```javascript
const axios = require('axios');

async function getCostOfLiving(city) {
  const response = await axios.get(
    `https://www.numbeo.com/cost-of-living/in/${city}`
  );
  const $ = require('cheerio').load(response.data);
  
  return {
    city,
    livingCost: $('.table-cell').eq(0).text(),
    rentCost: $('.table-cell').eq(1).text(),
    restaurantCost: $('.table-cell').eq(2).text()
  };
}
```

---

## 4️⃣ VISA & IMMIGRATION DATA

### Option 1: Manual Database (Best for Now)
```javascript
// backend/models/VisaRequirement.js
const visaSchema = new Schema({
  fromCountry: String,
  toCountry: String,
  visaType: String,
  requirements: [String],
  processingTime: String,
  cost: Number,
  officialWebsite: String,
  lastUpdated: Date
});

// Add visa data
db.visarequirements.insertMany([
  {
    fromCountry: "Pakistan",
    toCountry: "USA",
    visaType: "F-1 Student Visa",
    requirements: [
      "Valid passport",
      "I-20 from university",
      "Proof of funds",
      "Health insurance",
      "Bank statements"
    ],
    processingTime: "4-8 weeks",
    cost: 160,
    officialWebsite: "https://www.uscis.gov/",
    lastUpdated: new Date()
  }
]);
```

### Option 2: Schengen Visa Info
**Website:** https://www.schengenvisainfo.com/

**What They Provide:**
- Visa requirements for 26 countries
- Processing times
- Fees
- Documentation needed

**How to Integrate:**
1. Visit website
2. Manually enter data
3. Update quarterly

### Option 3: IATA Travel Pass API
**Website:** https://www.iatatravelpass.com/

**Info:** Limited data available
**Alternative:** Use government websites

---

## 5️⃣ EXCHANGE RATES (Optional)

### Option 1: Open Exchange Rates (Free & Best)
**Website:** https://openexchangerates.org/

**Steps:**
1. Go to: https://openexchangerates.org/
2. Sign up: Free tier
3. Get API key
4. Add to .env: `EXCHANGE_RATE_API_KEY=your_key`

**Free Tier:**
- 1000 requests/month
- Update hourly

**Example:**
```bash
curl "https://openexchangerates.org/api/latest.json?app_id=YOUR_KEY&base=USD"
```

---

### Option 2: XE Currency API (Paid)
**Website:** https://xecdapi.xe.com/

**Cost:** Free trial, then paid

---

## 📋 QUICK SETUP GUIDE

### Step 1: Get All API Keys (15 minutes)

```bash
✅ Unirank API
   → Go to: https://www.unirank.org/api
   → Sign up for free
   → Copy API key

✅ Numbeo API (Cost of Living)
   → Go to: https://www.numbeo.com/api/
   → Sign up for free (100 req/month)
   → Copy API key

✅ Open Exchange Rates (Optional)
   → Go to: https://openexchangerates.org/
   → Sign up for free (1000 req/month)
   → Copy API key

✅ Fulbright, DAAD, Erasmus+ (Manual)
   → Visit websites
   → Create local database
   → Update quarterly
```

### Step 2: Update .env File

```bash
# backend/.env.production

# University Data
UNIRANK_API_KEY=your_unirank_key

# Cost of Living
NUMBEO_API_KEY=your_numbeo_key

# Exchange Rates
EXCHANGE_RATE_API_KEY=your_xe_key

# Optional - For web scraping
SCRAPER_ENABLED=true
SCRAPER_UPDATE_INTERVAL=weekly
```

### Step 3: Create Data Import Routes

```javascript
// backend/routes/adminRoutes.js
const router = require('express').Router();
const axios = require('axios');
const University = require('../models/University');

// Import universities from Unirank
router.post('/import-unirank', async (req, res) => {
  try {
    const response = await axios.get(
      'https://www.unirank.org/api/universities',
      {
        headers: {
          'Authorization': `Bearer ${process.env.UNIRANK_API_KEY}`
        },
        params: { limit: 5000, page: 1 }
      }
    );

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

    await University.insertMany(universities);
    res.json({
      success: true,
      message: `Imported ${universities.length} universities`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Step 4: Setup Scheduled Updates

```javascript
// backend/jobs/dataImportJobs.js
const cron = require('node-cron');

// Update universities daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Updating university data from Unirank...');
  // Call import function
});

// Update cost of living weekly
cron.schedule('0 3 * * 1', async () => {
  console.log('⏰ Updating cost of living data...');
  // Call import function
});

// Update exchange rates daily
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Updating exchange rates...');
  // Call import function
});
```

---

## 💰 COST BREAKDOWN

| API | Free Tier | Paid Tier | Recommendation |
|-----|-----------|-----------|-----------------|
| **Unirank** | Yes (Full) | $500/month | ✅ USE FREE |
| **Numbeo** | 100 req/mo | $10-50/mo | ✅ USE FREE or $10 |
| **Open Exchange** | 1000 req/mo | $20-100/mo | ✅ USE FREE |
| **QS Rankings** | No | $100-500/mo | ❌ Too expensive |
| **THE Rankings** | No | Custom | ❌ Too expensive |
| **Fulbright** | Manual | Manual | ✅ ADD MANUALLY |
| **DAAD** | Manual | API available | ✅ ADD MANUALLY |

**Total Monthly Cost: $0-60 (if using paid tiers)**

---

## 🎯 IMPLEMENTATION TIMELINE

### Week 1:
- [ ] Get Unirank API key
- [ ] Import 5000+ universities
- [ ] Create university model

### Week 2:
- [ ] Add 100+ scholarships manually
- [ ] Integrate Numbeo API
- [ ] Create cost of living endpoint

### Week 3:
- [ ] Add visa requirements
- [ ] Integrate exchange rates
- [ ] Setup scheduled imports

### Week 4:
- [ ] Test all data endpoints
- [ ] Optimize database queries
- [ ] Deploy to production

---

## ✅ TESTING YOUR DATA

### Test University Data:
```bash
curl http://localhost:5000/api/universities?country=USA
```

### Test Cost of Living:
```bash
curl http://localhost:5000/api/cost-of-living?city=London
```

### Test Scholarships:
```bash
curl http://localhost:5000/api/scholarships?country=USA
```

### Test Exchange Rates:
```bash
curl http://localhost:5000/api/exchange-rates?from=USD&to=PKR
```

---

## 📊 EXPECTED DATA AFTER INTEGRATION

### Universities Table:
```
Total: 5000+
Countries: 180+
Average Fees: $20,000-50,000
Programs: 10,000+
Ranking: 1-5000
```

### Scholarships Table:
```
Total: 500+
Countries: 50+
Average Amount: $10,000-30,000
Deadline: Quarterly
```

### Cost of Living:
```
Cities: 500+
Cost Index: 50-250
Rent Index: 30-400
Updated: Daily
```

---

## 🚀 DEPLOY WITH DATA

After integration, deploy to production:

```bash
# 1. Test locally
npm test

# 2. Import real data
curl -X POST http://localhost:5000/api/admin/import-unirank

# 3. Deploy
bash deploy.sh

# 4. Monitor
# Check: https://dashboard.monitoring.com
```

---

**Ready? Start with Unirank API today! It's free and has the best data.** 🚀
