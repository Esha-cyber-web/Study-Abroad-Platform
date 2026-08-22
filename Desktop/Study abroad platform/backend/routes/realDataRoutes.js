const express = require('express');
const router = express.Router();
const University = require('../models/University');
const CostOfLiving = require('../models/CostOfLiving');
const Scholarship = require('../models/Scholarship');
const VisaRequirement = require('../models/VisaRequirement');
const { getUsdRates } = require('../services/liveExchangeRates');
const { getCountryByName } = require('../services/restCountriesClient');
const { protect, authorize } = require('../middleware/authMiddleware');

// ─── LIVE EXTERNAL DATA (no DB) ───────────────────────────────────────────

router.get('/exchange-rates', async (req, res) => {
  try {
    const rates = await getUsdRates();
    res.json({
      success: true,
      base: 'USD',
      rates,
      source: 'live',
      note: 'USD base; values are units of each currency per 1 USD.',
    });
  } catch (err) {
    console.error('exchange-rates:', err.message);
    res.status(502).json({
      success: false,
      error: 'Could not load live exchange rates',
      detail: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

router.get('/convert', async (req, res) => {
  try {
    const amount = Number(req.query.amount);
    const from = (req.query.from || 'USD').toUpperCase();
    const to = (req.query.to || 'PKR').toUpperCase();

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    if (from === to) {
      return res.json({ success: true, amount, from, to, rate: 1 });
    }

    const rates = await getUsdRates();

    const toUsd = (amt, currency) => {
      if (currency === 'USD') return amt;
      const r = rates[currency];
      if (r == null) throw new Error(`Unknown currency: ${currency}`);
      return amt / r;
    };

    const fromUsd = (amtUsd, currency) => {
      if (currency === 'USD') return amtUsd;
      const r = rates[currency];
      if (r == null) throw new Error(`Unknown currency: ${currency}`);
      return amtUsd * r;
    };

    const usdAmount = toUsd(amount, from);
    const converted = fromUsd(usdAmount, to);
    const rate = amount === 0 ? 0 : converted / amount;

    res.json({
      success: true,
      amount: converted,
      originalAmount: amount,
      from,
      to,
      rate,
    });
  } catch (err) {
    console.error('convert:', err.message);
    res.status(502).json({
      success: false,
      error: 'Conversion failed',
      detail: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

router.get('/country-info', async (req, res) => {
  try {
    const q = req.query.q || req.query.name;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query ?q= or ?name= country name is required' });
    }
    const info = await getCountryByName(q);
    if (!info) {
      return res.status(404).json({ success: false, error: 'Country not found' });
    }
    res.json({ success: true, data: info, source: 'restcountries.com' });
  } catch (err) {
    console.error('country-info:', err.message);
    const status = err.response?.status === 404 ? 404 : 502;
    res.status(status).json({
      success: false,
      error: status === 404 ? 'Country not found' : 'Could not load country data',
      detail: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

// ─── UNIVERSITY + DB ENRICHMENT ───────────────────────────────────────────

router.get('/universities-with-data', async (req, res) => {
  try {
    const { country, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };

    if (country && country !== 'All') {
      filter.country = { $regex: country, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      filter.fees = {};
      if (minPrice) filter.fees.$gte = Number(minPrice);
      if (maxPrice) filter.fees.$lte = Number(maxPrice);
    }
    if (search && String(search).trim()) {
      const rx = { $regex: String(search).trim(), $options: 'i' };
      filter.$or = [{ name: rx }, { city: rx }, { country: rx }, { description: rx }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const universities = await University.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const enriched = await Promise.all(
      universities.map(async (uni) => {
        const costOfLiving = await CostOfLiving.findOne({ city: uni.city }).lean();
        const scholarships = await Scholarship.find({
          $or: [{ country: uni.country }, { university: uni.name }],
          isActive: true,
        }).lean();
        const visaReqs = await VisaRequirement.findOne({
          toCountry: uni.country,
          visaType: 'Student Visa',
        }).lean();

        return {
          ...uni,
          costOfLiving: costOfLiving || { note: 'Data not available' },
          availableScholarships: scholarships.length,
          visaInfo: visaReqs || { note: 'Data not available' },
        };
      })
    );

    const total = await University.countDocuments(filter);

    res.json({
      success: true,
      data: enriched,
      total,
      pages: Math.ceil(total / Number(limit)),
      page: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/cost-of-living/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const costData = await CostOfLiving.findOne({ city: { $regex: city, $options: 'i' } });

    if (!costData) {
      return res.status(404).json({ error: 'Cost of living data not found for this city' });
    }

    res.json({
      success: true,
      data: costData,
      studentEstimate: {
        monthly:
          (costData.prices?.avgRent || 0) +
          (costData.prices?.avgGroceries || 0) * 4 +
          (costData.prices?.avgTransport || 0),
        annual:
          (costData.prices?.avgRent || 0) * 12 +
          (costData.prices?.avgGroceries || 0) * 52 +
          (costData.prices?.avgTransport || 0) * 12,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/scholarships', async (req, res) => {
  try {
    const { country, minAmount, maxAmount, provider, deadline } = req.query;

    const filter = { isActive: true };

    if (country) {
      filter.$or = [
        { country: { $regex: country, $options: 'i' } },
        { eligibleCountries: country },
        { eligibleCountries: { $regex: country, $options: 'i' } },
      ];
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }
    if (provider) {
      filter.provider = { $regex: provider, $options: 'i' };
    }
    if (deadline) {
      filter.deadline = { $gte: new Date(deadline) };
    }

    const scholarships = await Scholarship.find(filter).sort({ amount: -1 }).lean();

    res.json({
      success: true,
      count: scholarships.length,
      data: scholarships,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/scholarships/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    res.json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/visa-requirements', async (req, res) => {
  try {
    const { fromCountry, toCountry } = req.query;

    if (!fromCountry || !toCountry) {
      return res.status(400).json({
        error: 'fromCountry and toCountry are required',
      });
    }

    const visa = await VisaRequirement.findOne({
      fromCountry: { $regex: fromCountry, $options: 'i' },
      toCountry: { $regex: toCountry, $options: 'i' },
      visaType: 'Student Visa',
    });

    if (!visa) {
      return res.status(404).json({
        error: 'Visa requirements not found',
      });
    }

    res.json({
      success: true,
      data: visa,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/import-scholarships', protect, authorize('admin'), async (req, res) => {
  try {
    const scholarships = [
      {
        name: 'Fulbright Scholarship',
        provider: 'US State Department',
        country: 'USA',
        amount: 30000,
        currency: 'USD',
        level: ['Master', 'PhD'],
        requirements: {
          minCGPA: 3.5,
          minIELTS: 7.0,
        },
        eligibleCountries: ['Pakistan', 'India', 'Bangladesh'],
        deadline: new Date('2025-10-31'),
        website: 'https://fulbright.state.gov/',
        competitiveness: 'High',
      },
      {
        name: 'DAAD Scholarships',
        provider: 'DAAD',
        country: 'Germany',
        amount: 934,
        currency: 'EUR',
        level: ['Bachelor', 'Master', 'PhD'],
        requirements: {
          minCGPA: 3.0,
          minIELTS: 6.0,
        },
        eligibleCountries: ['Pakistan', 'India', 'Bangladesh'],
        deadline: new Date('2025-12-31'),
        website: 'https://www.daad.de/',
        competitiveness: 'Medium',
      },
    ];

    await Scholarship.deleteMany({ source: 'Manual' });
    await Scholarship.insertMany(scholarships);

    res.json({
      success: true,
      message: `Imported ${scholarships.length} scholarships`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/import-visa-requirements', protect, authorize('admin'), async (req, res) => {
  try {
    const visaRequirements = [
      {
        fromCountry: 'Pakistan',
        toCountry: 'USA',
        visaType: 'Student Visa',
        processingTimeMin: 28,
        processingTimeMax: 56,
        cost: 160,
        requirements: [
          'Valid passport',
          'Form I-20 from university',
          'Proof of financial support',
          'Health insurance',
          'Bank statements',
        ],
        proofOfFundsAmount: 30000,
        workRestrictionsPerWeek: 20,
        postStudyWorkVisa: {
          available: true,
          durationMonths: 12,
        },
        officialWebsite: 'https://www.uscis.gov/',
        difficultyLevel: 'Medium',
        source: 'Manual',
      },
    ];

    await VisaRequirement.deleteMany({ source: 'Manual' });
    await VisaRequirement.insertMany(visaRequirements);

    res.json({
      success: true,
      message: `Imported ${visaRequirements.length} visa requirements`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
