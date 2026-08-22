# 🎯 Real Data Integration Guide

This guide shows how to integrate real-world data into your StudyAbroad.ai application.

## 1️⃣ University Data Integration

### Option A: Unirank API
```javascript
// backend/routes/dataImport.js
const axios = require('axios');
const University = require('../models/University');

async function importUniversitiesFromUnirank() {
  try {
    const response = await axios.get('https://www.unirank.org/api/universities', {
      headers: {
        'Authorization': `Bearer ${process.env.UNIRANK_API_KEY}`
      }
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
      isActive: true
    }));

    await University.insertMany(universities);
    console.log(`✅ Imported ${universities.length} universities from Unirank`);
  } catch (error) {
    console.error('Error importing from Unirank:', error.message);
  }
}
```

### Option B: Direct MongoDB Import
```bash
# Import from CSV to MongoDB
mongoimport --uri "mongodb+srv://user:pass@cluster.mongodb.net/StudyAbroad" \
  --collection universities \
  --type csv \
  --headerline \
  --file universities_data.csv
```

### Option C: Web Scraping (Ethical)
```javascript
const cheerio = require('cheerio');
const axios = require('axios');

async function scrapeUniversityData(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  
  const universities = [];
  $('.university-card').each((i, el) => {
    universities.push({
      name: $(el).find('.uni-name').text(),
      country: $(el).find('.country').text(),
      ranking: parseInt($(el).find('.ranking').text())
    });
  });
  
  return universities;
}
```

---

## 2️⃣ Real-Time Data Updates

### Setup Scheduled Jobs (Node-Cron)
```javascript
// backend/jobs/updateUniversities.js
const cron = require('node-cron');
const axios = require('axios');

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Running scheduled university data update...');
  
  try {
    // Fetch latest data
    const data = await fetchLatestUniversityData();
    
    // Update database
    await updateUniversityDatabase(data);
    
    console.log('✅ University data updated successfully');
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
});
```

---

## 3️⃣ Scholarship Database Integration

```javascript
// backend/services/scholarshipService.js
const ScholarshipAPI = require('./externalAPIs/ScholarshipAPI');

async function fetchScholarships(filters) {
  const scholarships = [];
  
  // Fetch from Erasmus+
  const erasmusScholarships = await ScholarshipAPI.erasmusPlus(filters);
  scholarships.push(...erasmusScholarships);
  
  // Fetch from Fulbright
  const fulbrightScholarships = await ScholarshipAPI.fulbright(filters);
  scholarships.push(...fulbrightScholarships);
  
  // Fetch from Commonwealth
  const commonwealthScholarships = await ScholarshipAPI.commonwealth(filters);
  scholarships.push(...commonwealthScholarships);
  
  return scholarships.sort((a, b) => b.amount - a.amount);
}
```

---

## 4️⃣ Cost of Living Integration

```javascript
// backend/services/costOfLivingService.js
const axios = require('axios');

async function getCostOfLiving(city, country) {
  const response = await axios.get('https://www.numbeo.com/api/v1/indices/by_city', {
    params: {
      api_key: process.env.NUMBEO_API_KEY,
      query: `${city}, ${country}`
    }
  });
  
  return {
    city,
    country,
    costOfLiving: response.data.cost_of_living_index,
    rent: response.data.rent_index,
    restaurantPrice: response.data.restaurant_price_index,
    updated: new Date()
  };
}
```

---

## 5️⃣ Visa Requirements API

```javascript
// backend/services/visaService.js

async function getVisaRequirements(fromCountry, toCountry) {
  // Integration with visa requirement APIs
  const visaData = {
    from: fromCountry,
    to: toCountry,
    visaType: 'Student Visa',
    requirements: [
      'Valid Passport',
      'University Acceptance Letter',
      'Proof of Funds',
      'Health Insurance',
      'Language Test (IELTS/TOEFL)'
    ],
    processingTime: '4-8 weeks',
    cost: '$100-500',
    lastUpdated: new Date()
  };
  
  return visaData;
}
```

---

## 6️⃣ API Keys Required (.env)

```bash
# Real Data APIs
UNIRANK_API_KEY=your_unirank_key
QS_RANKINGS_API_KEY=your_qs_key
NUMBEO_API_KEY=your_numbeo_key
FULBRIGHT_API_KEY=your_fulbright_key

# Existing keys
OPENAI_API_KEY=sk-proj-...
GOOGLE_CLIENT_ID=...
MONGODB_URI=mongodb+srv://...
```

---

## 7️⃣ Data Refresh Schedule

| Data Source | Refresh Frequency | Update Method |
|-------------|------------------|-----------------|
| University Ranking | Monthly | API/Scraping |
| Scholarships | Weekly | API Pull |
| Cost of Living | Monthly | API Pull |
| Visa Requirements | Quarterly | Manual + API |
| Exchange Rates | Daily | API Pull |

---

## 8️⃣ Implementation Steps

### Step 1: Get API Keys
```bash
1. Unirank: Register at https://www.unirank.org/api
2. Numbeo: Get key at https://www.numbeo.com/api/
3. QS Quacquarelli: https://www.topuniversities.com/api
```

### Step 2: Install Required Packages
```bash
cd backend
npm install axios node-cron cheerio
```

### Step 3: Create Data Import Routes
```javascript
// backend/routes/adminRoutes.js
router.post('/import-universities', async (req, res) => {
  try {
    const count = await importUniversities();
    res.json({ success: true, message: `Imported ${count} universities` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 4: Schedule Automatic Updates
```javascript
// backend/server.js
require('./jobs/updateUniversities');
require('./jobs/updateScholarships');
require('./jobs/updateCostOfLiving');
```

### Step 5: Test Data Integration
```bash
curl -X POST http://localhost:5000/api/admin/import-universities \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 9️⃣ Monitoring Data Quality

```javascript
// backend/middleware/dataValidation.js

async function validateDataQuality(req, res, next) {
  const stats = await University.aggregate([
    { $group: {
      _id: null,
      totalCount: { $sum: 1 },
      avgFees: { $avg: '$fees' },
      countriesCount: { $sum: { $cond: ['$country', 1, 0] } }
    }}
  ]);
  
  console.log('📊 Data Quality Report:', stats[0]);
  next();
}
```

---

## 🔟 Backend Integration Example

```javascript
// backend/controllers/universityController.js (Updated)

exports.getUniversitiesWithRealData = async (req, res) => {
  try {
    const { country, minPrice, maxPrice, search } = req.query;
    
    // Fetch from MongoDB (cached data)
    let query = { isActive: true };
    
    if (country && country !== 'All') {
      query.country = { $regex: country, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      query.fees = {};
      if (minPrice) query.fees.$gte = Number(minPrice);
      if (maxPrice) query.fees.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    
    const universities = await University.find(query)
      .sort({ ranking: 1 })
      .limit(20);
    
    // Enrich with real-time data
    const enrichedUniversities = await Promise.all(
      universities.map(async (uni) => {
        const costOfLiving = await getCostOfLiving(uni.city, uni.country);
        const visaRequirements = await getVisaRequirements('Pakistan', uni.country);
        
        return {
          ...uni.toObject(),
          costOfLiving,
          visaRequirements
        };
      })
    );
    
    res.json({
      success: true,
      data: enrichedUniversities,
      total: universities.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 📈 Performance Tips

1. **Cache frequently accessed data**: Use Redis for 24-hour cache
2. **Batch API calls**: Combine multiple requests to reduce API costs
3. **Lazy load data**: Load enriched data on-demand, not by default
4. **Optimize database queries**: Use indexes on frequently filtered fields
5. **Rate limit API calls**: Respect API provider rate limits

---

## ✅ Testing Real Data Integration

```bash
# Test university data
curl http://localhost:5000/api/universities?country=USA

# Test with real-time enrichment
curl http://localhost:5000/api/universities/507f1f77bcf86cd799439011?enriched=true

# Test scholarship data
curl http://localhost:5000/api/scholarships?country=USA&minAmount=5000
```

---

**Next Steps:**
1. Get API keys from the providers
2. Update .env.production with keys
3. Implement data import routes
4. Schedule automatic updates
5. Monitor data quality
6. Deploy to production
