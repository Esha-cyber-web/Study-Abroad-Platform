const mongoose = require('mongoose');
const University = require('../models/University');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 }); // 5 min cache

const normalizeCountryQuery = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  const lookup = raw.toLowerCase();
  const countryMap = {
    uk: 'United Kingdom',
    'united kingdom': 'United Kingdom',
    usa: 'United States',
    'united states': 'United States',
    'u.s.a': 'United States',
    australia: 'Australia',
    canada: 'Canada',
    germany: 'Germany',
    pakistan: 'Pakistan',
    switzerland: 'Switzerland',
    netherlands: 'Netherlands',
    singapore: 'Singapore',
  };
  return countryMap[lookup] || raw;
};

const normalizeScholarships = (scholarships) => {
  if (Array.isArray(scholarships)) {
    const details = scholarships
      .map((item) => (typeof item === 'string' ? item : item?.details || item?.name || ''))
      .filter(Boolean)
      .join(', ');
    return {
      available: scholarships.length > 0,
      details,
      coverage: scholarships[0]?.coverage || 'Partial',
    };
  }

  if (scholarships && typeof scholarships === 'object') {
    return {
      available: Boolean(scholarships.available),
      details: scholarships.details || '',
      coverage: scholarships.coverage || '',
    };
  }

  return { available: false, details: '', coverage: '' };
};

const normalizeUniversity = (university = {}) => {
  const programs = Array.isArray(university.programs) && university.programs.length
    ? university.programs
    : (Array.isArray(university.courses) ? university.courses : []);

  return {
    ...university,
    name: university.name || '',
    country: university.country || '',
    city: university.city || '',
    logo: university.logo || university.image || '',
    image: university.image || university.logo || '',
    description: university.description || '',
    programs,
    courses: programs,
    scholarships: normalizeScholarships(university.scholarships),
  };
};

const fallbackUniversities = [
  {
    _id: 'demo-1',
    name: 'University of Oxford',
    country: 'United Kingdom',
    city: 'Oxford',
    ranking: 1,
    fees: 35000,
    living_cost: 15000,
    description: 'A flagship global research university with strong outcomes for international applicants.',
    eligibility: { min_cgpa: 3.8, ielts: 7.5, entry_test: 'GRE/GMAT' },
    visa_time: '3-8 Weeks',
    programs: ['Computer Science', 'Law'],
    scholarships: { available: true, details: 'Clarendon Fund and Oxford scholarships', coverage: 'Partial' },
    website: 'https://www.ox.ac.uk',
  },
  {
    _id: 'demo-2',
    name: 'Technical University of Munich',
    country: 'Germany',
    city: 'Munich',
    ranking: 50,
    fees: 0,
    living_cost: 12000,
    description: 'Renowned for engineering and applied sciences with strong industry ties.',
    eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'GRE (Optional)' },
    visa_time: '4-12 Weeks',
    programs: ['Engineering', 'Computer Science'],
    scholarships: { available: true, details: 'DAAD Scholarship', coverage: 'Partial' },
    website: 'https://www.tum.de',
  },
  {
    _id: 'demo-3',
    name: 'University of Toronto',
    country: 'Canada',
    city: 'Toronto',
    ranking: 25,
    fees: 28000,
    living_cost: 14000,
    description: 'World-class research university with broad global reputation.',
    eligibility: { min_cgpa: 3.5, ielts: 7.0, entry_test: 'None' },
    visa_time: '3-6 Months',
    programs: ['Business', 'Computer Science'],
    scholarships: { available: true, details: 'Pearson Scholarship', coverage: 'Partial' },
    website: 'https://www.utoronto.ca',
  },
  {
    _id: 'demo-4',
    name: 'National University of Singapore',
    country: 'Singapore',
    city: 'Singapore',
    ranking: 11,
    fees: 18000,
    living_cost: 12000,
    description: 'Top-ranked Asian university with excellent STEM opportunities.',
    eligibility: { min_cgpa: 3.6, ielts: 6.5, entry_test: 'None' },
    visa_time: '4-8 Weeks',
    programs: ['Engineering', 'Computing'],
    scholarships: { available: false, details: 'No scholarships are listed for this demo entry.', coverage: 'N/A' },
    website: 'https://www.nus.edu.sg',
  },
];

const getFallbackUniversities = (query = {}) => {
  let data = fallbackUniversities.map(normalizeUniversity);
  const { search, country, maxPrice, hasScholarship } = query;
  const normalizedCountry = normalizeCountryQuery(country);

  if (search) {
    const needle = String(search).toLowerCase();
    data = data.filter((u) => [u.name, u.country, u.city, u.description].join(' ').toLowerCase().includes(needle));
  }
  if (normalizedCountry && normalizedCountry !== 'All') {
    data = data.filter((u) => String(u.country).toLowerCase() === normalizedCountry.toLowerCase());
  }
  if (maxPrice) {
    data = data.filter((u) => Number(u.fees) <= Number(maxPrice));
  }
  if (hasScholarship === 'true' || hasScholarship === true) {
    data = data.filter((u) => u.scholarships?.available);
  }
  return data;
};

// 1. Get All Universities (Filtered + Paginated)
exports.getUniversities = async (req, res) => {
  try {
    const { maxPrice, minPrice, country, course, search, minRank, maxRank, minIELTS, hasScholarship, page = 1, limit = 12 } = req.query;
    const normalizedCountry = normalizeCountryQuery(country);

    if (!process.env.MONGO_URI || process.env.DB_CONNECTED !== 'true') {
      const data = getFallbackUniversities({ search, country: normalizedCountry, maxPrice, hasScholarship });
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 12;
      const start = (pageNum - 1) * limitNum;
      const paged = data.slice(start, start + limitNum);
      return res.status(200).json({
        success: true,
        count: paged.length,
        total: data.length,
        page: pageNum,
        pages: Math.max(1, Math.ceil(data.length / limitNum)),
        data: paged,
      });
    }

    let filter = { isActive: true };

    if (maxPrice) filter.fees = { ...filter.fees, $lte: Number(maxPrice) };
    if (minPrice) filter.fees = { ...filter.fees, $gte: Number(minPrice) };
    if (normalizedCountry && normalizedCountry !== 'All') filter.country = { $regex: normalizedCountry, $options: 'i' };
    if (course) filter.courses = { $in: [new RegExp(course, 'i')] };
    if (minRank) filter.ranking = { ...filter.ranking, $gte: Number(minRank) };
    if (maxRank) filter.ranking = { ...filter.ranking, $lte: Number(maxRank) };
    if (minIELTS) filter['eligibility.ielts'] = { $lte: Number(minIELTS) };
    if (hasScholarship === 'true') filter['scholarships.available'] = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const universities = await University.find(filter).sort({ ranking: 1 }).skip(skip).limit(Number(limit)).lean();
    const total = await University.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: universities.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: universities.map(normalizeUniversity),
    });
  } catch (error) {
    console.error('getUniversities error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllUniversities = exports.getUniversities;

// 2. Get Single University
exports.getUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!process.env.MONGO_URI || process.env.DB_CONNECTED !== 'true') {
      const fallbackUniversity = getFallbackUniversities().find((u) => String(u._id) === String(id));
      if (fallbackUniversity) return res.status(200).json({ success: true, data: fallbackUniversity });
      return res.status(404).json({ success: false, message: 'University not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid university ID format' });
    }

    const university = await University.findById(new mongoose.Types.ObjectId(id));
    if (!university) return res.status(404).json({ success: false, message: 'University not found' });
    const plainUniversity = university.toObject ? university.toObject() : university;
    res.status(200).json({ success: true, data: normalizeUniversity(plainUniversity) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUniversityById = exports.getUniversity;

// 3. Add University (Admin)
exports.addUniversity = async (req, res) => {
  try {
    if (req.body.fees < 0) return res.status(400).json({ error: 'Fees cannot be negative' });
    const university = await University.create(req.body);
    cache.flushAll();
    res.status(201).json({ success: true, data: university });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Update University (Admin)
exports.updateUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!university) return res.status(404).json({ success: false, message: 'University not found' });
    cache.flushAll();
    res.status(200).json({ success: true, data: university });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Delete University (Soft Delete)
exports.deleteUniversity = async (req, res) => {
  try {
    await University.findByIdAndUpdate(req.params.id, { isActive: false });
    cache.flushAll();
    res.status(200).json({ success: true, message: 'University removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. Seed Universities (Dev helper — populates DB with comprehensive real data)
exports.seedUniversities = async (req, res) => {
  try {
    // Delete old/demo data first so there's no duplication or stale data
    await University.deleteMany({});

    const universities = [
      // ===================== PAKISTAN =====================
      { name: 'National University of Sciences and Technology (NUST)', country: 'Pakistan', city: 'Islamabad', ranking: 355, fees: 1200, living_cost: 3000, currency: 'USD', description: "Pakistan's top-ranked university for engineering, IT and business.", eligibility: { min_cgpa: 3.0, ielts: 0, entry_test: 'NET' }, visa_time: 'N/A (Local Student)', courses: ['Computer Science', 'Electrical Engineering', 'Business'], scholarships: [{ name: 'NUST Merit & Need-Based Scholarship', details: 'Up to 100% tuition waiver', coverage: 'Partial/Full' }], website: 'https://nust.edu.pk', isActive: true },
      { name: 'Quaid-i-Azam University (QAU)', country: 'Pakistan', city: 'Islamabad', ranking: 601, fees: 700, living_cost: 2500, currency: 'USD', description: 'Top public research university, strong in sciences.', eligibility: { min_cgpa: 2.5, ielts: 0, entry_test: 'University Test' }, visa_time: 'N/A (Local Student)', courses: ['Physics', 'Computer Science', 'Economics'], scholarships: [{ name: 'HEC Need-Based Scholarship', details: 'Full fee waiver for deserving students', coverage: 'Full' }], website: 'https://qau.edu.pk', isActive: true },
      { name: 'Lahore University of Management Sciences (LUMS)', country: 'Pakistan', city: 'Lahore', ranking: 800, fees: 4500, living_cost: 3500, currency: 'USD', description: 'Leading private university for business and computer science.', eligibility: { min_cgpa: 3.0, ielts: 0, entry_test: 'LUMS Test/SAT' }, visa_time: 'N/A (Local Student)', courses: ['Business Administration', 'Computer Science', 'Economics'], scholarships: [{ name: 'National Outreach Programme', details: '100% fully funded for underprivileged students', coverage: 'Full' }], website: 'https://lums.edu.pk', isActive: true },
      { name: 'FAST National University (NUCES)', country: 'Pakistan', city: 'Lahore / Islamabad / Karachi', ranking: 900, fees: 1300, living_cost: 2800, currency: 'USD', description: 'Premier institute for Software Engineering and CS.', eligibility: { min_cgpa: 2.5, ielts: 0, entry_test: 'NU Test' }, visa_time: 'N/A (Local Student)', courses: ['Software Engineering', 'Computer Science', 'Data Science'], scholarships: [{ name: 'FAST Financial Assistance', details: 'Need-based loan/scholarship', coverage: 'Partial' }], website: 'https://nu.edu.pk', isActive: true },
      { name: 'COMSATS University Islamabad', country: 'Pakistan', city: 'Islamabad / Lahore / Sahiwal', ranking: 950, fees: 1000, living_cost: 2200, currency: 'USD', description: 'Multi-campus tech and science leader.', eligibility: { min_cgpa: 2.5, ielts: 0, entry_test: 'NTS/University Test' }, visa_time: 'N/A (Local Student)', courses: ['Computer Science', 'Artificial Intelligence', 'Cyber Security'], scholarships: [{ name: 'PEEF & Worker Welfare Fund', details: '100% fully funded for eligible quota students', coverage: 'Full' }], website: 'https://comsats.edu.pk', isActive: true },
      { name: 'University of the Punjab (PU)', country: 'Pakistan', city: 'Lahore', ranking: 1100, fees: 500, living_cost: 2000, currency: 'USD', description: 'Historic public institution with broad academic programs.', eligibility: { min_cgpa: 2.5, ielts: 0, entry_test: 'University Test' }, visa_time: 'N/A (Local Student)', courses: ['Law', 'Computer Science', 'Social Sciences'], scholarships: [{ name: 'PEEF Scholarship', details: 'Partial to full fee waiver', coverage: 'Partial/Full' }], website: 'https://pu.edu.pk', isActive: true },
      { name: 'University of Karachi', country: 'Pakistan', city: 'Karachi', ranking: 1200, fees: 450, living_cost: 2000, currency: 'USD', description: "Sindh's largest public university.", eligibility: { min_cgpa: 2.5, ielts: 0, entry_test: 'University Test' }, visa_time: 'N/A (Local Student)', courses: ['Business', 'Pharmacy', 'Computer Science'], scholarships: [{ name: 'Sindh Educational Endowment Fund', details: 'Need-based support', coverage: 'Partial' }], website: 'https://uok.edu.pk', isActive: true },
      { name: 'Ghulam Ishaq Khan Institute (GIKI)', country: 'Pakistan', city: 'Swabi', ranking: 1000, fees: 2500, living_cost: 2800, currency: 'USD', description: 'Top private engineering institute.', eligibility: { min_cgpa: 3.0, ielts: 0, entry_test: 'GIKI Test' }, visa_time: 'N/A (Local Student)', courses: ['Mechanical Engineering', 'Computer Science', 'Electrical Engineering'], scholarships: [{ name: 'GIKI Merit Scholarship', details: 'Up to 100% fee waiver', coverage: 'Partial/Full' }], website: 'https://giki.edu.pk', isActive: true },
      { name: 'University of Engineering and Technology (UET) Lahore', country: 'Pakistan', city: 'Lahore', ranking: 1050, fees: 600, living_cost: 2200, currency: 'USD', description: "Pakistan's oldest engineering university.", eligibility: { min_cgpa: 2.5, ielts: 0, entry_test: 'ECAT' }, visa_time: 'N/A (Local Student)', courses: ['Civil Engineering', 'Computer Science', 'Electrical Engineering'], scholarships: [{ name: 'UET Need-Based Scholarship', details: 'Partial fee support', coverage: 'Partial' }], website: 'https://uet.edu.pk', isActive: true },
      { name: 'Aga Khan University (AKU)', country: 'Pakistan', city: 'Karachi', ranking: 700, fees: 6500, living_cost: 3500, currency: 'USD', description: 'World-class medical and health sciences university.', eligibility: { min_cgpa: 3.2, ielts: 0, entry_test: 'AKU-EB/MCAT' }, visa_time: 'N/A (Local Student)', courses: ['Medicine', 'Nursing', 'Public Health'], scholarships: [{ name: 'AKU Need-Based Financial Aid', details: 'Grant and loan combination', coverage: 'Partial/Full' }], website: 'https://aku.edu', isActive: true },

      // ===================== USA =====================
      { name: 'Arizona State University', country: 'United States', city: 'Tempe', ranking: 121, fees: 29000, living_cost: 14000, currency: 'USD', description: 'Large, innovation-focused public research university, popular with international students.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'TOEFL/IELTS' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Computer Science', 'Business', 'Engineering'], scholarships: [{ name: 'International Merit Scholarship', details: 'Up to $12,000/year', coverage: 'Partial' }], website: 'https://asu.edu', isActive: true },
      { name: 'University of Texas at Arlington', country: 'United States', city: 'Arlington', ranking: 350, fees: 22000, living_cost: 13000, currency: 'USD', description: 'Popular for affordable STEM graduate programs.', eligibility: { min_cgpa: 2.75, ielts: 6.0, entry_test: 'TOEFL/IELTS' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Computer Science', 'Data Science', 'Engineering'], scholarships: [{ name: 'UTA Global Scholarship', details: 'Partial tuition award', coverage: 'Partial' }], website: 'https://uta.edu', isActive: true },
      { name: 'Northeastern University', country: 'United States', city: 'Boston', ranking: 44, fees: 58000, living_cost: 22000, currency: 'USD', description: 'Known for co-op work programs alongside study.', eligibility: { min_cgpa: 3.3, ielts: 7.0, entry_test: 'TOEFL/IELTS' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Computer Science', 'Business Analytics', 'Engineering'], scholarships: [{ name: 'Global Scholars Award', details: 'Merit-based partial tuition', coverage: 'Partial' }], website: 'https://northeastern.edu', isActive: true },
      { name: 'Purdue University', country: 'United States', city: 'West Lafayette', ranking: 43, fees: 32000, living_cost: 13000, currency: 'USD', description: 'Top-ranked engineering and computer science programs.', eligibility: { min_cgpa: 3.3, ielts: 6.5, entry_test: 'TOEFL/IELTS' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Engineering', 'Computer Science', 'Data Science'], scholarships: [{ name: 'Purdue Graduate Assistantship', details: 'Tuition waiver + stipend for TA/RA roles', coverage: 'Full' }], website: 'https://purdue.edu', isActive: true },
      { name: 'University of Michigan - Ann Arbor', country: 'United States', city: 'Ann Arbor', ranking: 25, fees: 55000, living_cost: 18000, currency: 'USD', description: 'Top public research university, strong across all disciplines.', eligibility: { min_cgpa: 3.5, ielts: 7.0, entry_test: 'TOEFL/IELTS' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Engineering', 'Business', 'Computer Science'], scholarships: [{ name: 'Rackham Merit Fellowship', details: 'Full funding for select grad students', coverage: 'Full' }], website: 'https://umich.edu', isActive: true },
      { name: 'Ohio State University', country: 'United States', city: 'Columbus', ranking: 43, fees: 34000, living_cost: 14000, currency: 'USD', description: 'Large research university with strong international student support.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'TOEFL/IELTS' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Computer Science', 'Engineering', 'Business'], scholarships: [{ name: 'International Affairs Scholarship', details: 'Partial tuition award', coverage: 'Partial' }], website: 'https://osu.edu', isActive: true },
      { name: 'University of Illinois Urbana-Champaign', country: 'United States', city: 'Champaign', ranking: 34, fees: 35000, living_cost: 14000, currency: 'USD', description: 'Elite engineering and computer science programs.', eligibility: { min_cgpa: 3.4, ielts: 6.5, entry_test: 'TOEFL/IELTS' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Computer Science', 'Engineering', 'Data Science'], scholarships: [{ name: 'Graduate College Fellowship', details: 'Tuition waiver + stipend', coverage: 'Full' }], website: 'https://illinois.edu', isActive: true },
      { name: 'University at Buffalo', country: 'United States', city: 'Buffalo', ranking: 265, fees: 24000, living_cost: 12000, currency: 'USD', description: 'Affordable public research university, large international community.', eligibility: { min_cgpa: 2.75, ielts: 6.0, entry_test: 'TOEFL/IELTS' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Computer Science', 'Data Science', 'Business Analytics'], scholarships: [{ name: 'UB Presidential Scholarship', details: 'Up to $10,000/year', coverage: 'Partial' }], website: 'https://buffalo.edu', isActive: true },
      { name: 'University of South Florida', country: 'United States', city: 'Tampa', ranking: 264, fees: 21000, living_cost: 12000, currency: 'USD', description: 'Growing research university with generous merit scholarships.', eligibility: { min_cgpa: 2.75, ielts: 6.0, entry_test: 'TOEFL/IELTS' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Computer Science', 'Engineering', 'Public Health'], scholarships: [{ name: 'USF Graduate Fee Waiver', details: 'Tuition fee waiver for assistantship holders', coverage: 'Partial' }], website: 'https://usf.edu', isActive: true },
      { name: 'Harvard University', country: 'United States', city: 'Cambridge', ranking: 3, fees: 58000, living_cost: 22000, currency: 'USD', description: 'Prestigious Ivy League institution known for academic excellence.', eligibility: { min_cgpa: 3.9, ielts: 7.5, entry_test: 'SAT/GRE' }, visa_time: '2-3 Months (F-1 Visa)', courses: ['Business', 'Law', 'Computer Science'], scholarships: [{ name: 'Harvard Financial Aid', details: 'Full need-based aid, no loans', coverage: 'Full' }], website: 'https://harvard.edu', isActive: true },

      // ===================== UK =====================
      { name: 'University of Bedfordshire', country: 'United Kingdom', city: 'Luton', ranking: 801, fees: 15000, living_cost: 10000, currency: 'GBP', description: 'Known for practical teaching and strong student support.', eligibility: { min_cgpa: 2.5, ielts: 6.0, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Business', 'IT', 'Nursing'], scholarships: [{ name: "Vice Chancellor's Merit Award", details: 'Up to £2,000', coverage: 'Partial' }], website: 'https://beds.ac.uk', isActive: true },
      { name: 'Coventry University', country: 'United Kingdom', city: 'Coventry', ranking: 601, fees: 17000, living_cost: 11000, currency: 'GBP', description: 'Modern university popular with international applicants.', eligibility: { min_cgpa: 2.7, ielts: 6.0, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Computer Science', 'Business', 'Engineering'], scholarships: [{ name: 'International Scholarship', details: 'Up to £3,000', coverage: 'Partial' }], website: 'https://coventry.ac.uk', isActive: true },
      { name: 'University of Hertfordshire', country: 'United Kingdom', city: 'Hatfield', ranking: 700, fees: 15500, living_cost: 10500, currency: 'GBP', description: 'Strong industry links and career support.', eligibility: { min_cgpa: 2.5, ielts: 6.0, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Computer Science', 'Engineering', 'Business'], scholarships: [{ name: 'Global Excellence Scholarship', details: 'Up to £2,500', coverage: 'Partial' }], website: 'https://herts.ac.uk', isActive: true },
      { name: 'University of Leeds', country: 'United Kingdom', city: 'Leeds', ranking: 75, fees: 27000, living_cost: 13000, currency: 'GBP', description: 'Top Russell Group university with strong research output.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Computer Science', 'Business', 'Engineering'], scholarships: [{ name: 'Leeds International Scholarship', details: 'Up to £5,000', coverage: 'Partial' }], website: 'https://leeds.ac.uk', isActive: true },
      { name: 'University of Birmingham', country: 'United Kingdom', city: 'Birmingham', ranking: 84, fees: 26000, living_cost: 13000, currency: 'GBP', description: 'Leading research-intensive Russell Group university.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Business', 'Engineering', 'Computer Science'], scholarships: [{ name: 'Birmingham Global Masters Scholarship', details: 'Up to £5,000', coverage: 'Partial' }], website: 'https://birmingham.ac.uk', isActive: true },
      { name: "King's College London", country: 'United Kingdom', city: 'London', ranking: 40, fees: 32000, living_cost: 16000, currency: 'GBP', description: 'Prestigious London-based research university.', eligibility: { min_cgpa: 3.3, ielts: 7.0, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Law', 'Medicine', 'Computer Science'], scholarships: [{ name: "King's International Scholarship", details: 'Up to £5,000', coverage: 'Partial' }], website: 'https://kcl.ac.uk', isActive: true },
      { name: 'University of Manchester', country: 'United Kingdom', city: 'Manchester', ranking: 34, fees: 29000, living_cost: 14000, currency: 'GBP', description: 'One of the largest and most research-active UK universities.', eligibility: { min_cgpa: 3.2, ielts: 6.5, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Engineering', 'Business', 'Computer Science'], scholarships: [{ name: 'Manchester Global Futures Scholarship', details: 'Up to £5,000', coverage: 'Partial' }], website: 'https://manchester.ac.uk', isActive: true },
      { name: 'University College London (UCL)', country: 'United Kingdom', city: 'London', ranking: 9, fees: 34000, living_cost: 17000, currency: 'GBP', description: 'World top-10 university with strong global reputation.', eligibility: { min_cgpa: 3.5, ielts: 7.0, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Computer Science', 'Architecture', 'Law'], scholarships: [{ name: 'UCL Global Undergraduate Scholarship', details: 'Full or partial tuition', coverage: 'Partial/Full' }], website: 'https://ucl.ac.uk', isActive: true },
      { name: 'Imperial College London', country: 'United Kingdom', city: 'London', ranking: 6, fees: 38000, living_cost: 17000, currency: 'GBP', description: 'Elite STEM-focused research university.', eligibility: { min_cgpa: 3.6, ielts: 7.0, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Engineering', 'Computer Science', 'Medicine'], scholarships: [{ name: "President's Scholarship", details: 'Full tuition + stipend', coverage: 'Full' }], website: 'https://imperial.ac.uk', isActive: true },
      { name: 'University of Oxford', country: 'United Kingdom', city: 'Oxford', ranking: 1, fees: 35000, living_cost: 15000, currency: 'GBP', description: 'The oldest university in the English-speaking world.', eligibility: { min_cgpa: 3.8, ielts: 7.5, entry_test: 'None' }, visa_time: '3-8 Weeks (UK Student Visa)', courses: ['Law', 'Medicine', 'Computer Science'], scholarships: [{ name: 'Clarendon Fund', details: 'Full tuition + living costs', coverage: 'Full' }], website: 'https://ox.ac.uk', isActive: true },

      // ===================== CANADA =====================
      { name: 'Conestoga College', country: 'Canada', city: 'Kitchener', ranking: 999, fees: 15000, living_cost: 12000, currency: 'CAD', description: 'Popular applied-learning college with strong co-op programs.', eligibility: { min_cgpa: 2.5, ielts: 6.0, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['IT', 'Business', 'Engineering Technology'], scholarships: [{ name: 'Conestoga Entrance Scholarship', details: 'Up to CAD 2,000', coverage: 'Partial' }], website: 'https://conestogac.on.ca', isActive: true },
      { name: 'Algoma University', country: 'Canada', city: 'Sault Ste. Marie', ranking: 999, fees: 17000, living_cost: 11000, currency: 'CAD', description: 'Affordable university with high visa approval rate.', eligibility: { min_cgpa: 2.5, ielts: 6.0, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['Business', 'Computer Science', 'Community Development'], scholarships: [{ name: 'Algoma Entrance Award', details: 'Up to CAD 2,500', coverage: 'Partial' }], website: 'https://algomau.ca', isActive: true },
      { name: 'University of Windsor', country: 'Canada', city: 'Windsor', ranking: 601, fees: 20000, living_cost: 12000, currency: 'CAD', description: 'Comprehensive university close to the US border.', eligibility: { min_cgpa: 2.7, ielts: 6.5, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['Engineering', 'Computer Science', 'Business'], scholarships: [{ name: 'International Entrance Scholarship', details: 'Up to CAD 5,000', coverage: 'Partial' }], website: 'https://uwindsor.ca', isActive: true },
      { name: 'Simon Fraser University', country: 'Canada', city: 'Burnaby', ranking: 301, fees: 28000, living_cost: 14000, currency: 'CAD', description: 'Strong co-op program and research output.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['Computer Science', 'Business', 'Engineering'], scholarships: [{ name: 'SFU International Scholarship', details: 'Up to CAD 6,000', coverage: 'Partial' }], website: 'https://sfu.ca', isActive: true },
      { name: 'York University', country: 'Canada', city: 'Toronto', ranking: 501, fees: 27000, living_cost: 15000, currency: 'CAD', description: 'Large, diverse university in the Greater Toronto Area.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['Business', 'Computer Science', 'Law'], scholarships: [{ name: 'York International Scholarship', details: 'Up to CAD 5,000', coverage: 'Partial' }], website: 'https://yorku.ca', isActive: true },
      { name: 'University of Calgary', country: 'Canada', city: 'Calgary', ranking: 251, fees: 25000, living_cost: 13000, currency: 'CAD', description: 'Leading research university in Western Canada.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['Engineering', 'Computer Science', 'Business'], scholarships: [{ name: 'Calgary International Entrance Scholarship', details: 'Up to CAD 12,000', coverage: 'Partial' }], website: 'https://ucalgary.ca', isActive: true },
      { name: 'McMaster University', country: 'Canada', city: 'Hamilton', ranking: 189, fees: 30000, living_cost: 14000, currency: 'CAD', description: 'Top-ranked research university, strong in health sciences and engineering.', eligibility: { min_cgpa: 3.2, ielts: 6.5, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['Engineering', 'Health Sciences', 'Business'], scholarships: [{ name: 'McMaster International Excellence Award', details: 'Up to CAD 10,000', coverage: 'Partial' }], website: 'https://mcmaster.ca', isActive: true },
      { name: 'University of Alberta', country: 'Canada', city: 'Edmonton', ranking: 111, fees: 27000, living_cost: 13000, currency: 'CAD', description: 'Comprehensive research university with strong engineering programs.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['Engineering', 'Computer Science', 'Business'], scholarships: [{ name: 'International Undergraduate Award', details: 'Up to CAD 15,000', coverage: 'Partial' }], website: 'https://ualberta.ca', isActive: true },
      { name: 'University of British Columbia', country: 'Canada', city: 'Vancouver', ranking: 34, fees: 34000, living_cost: 16000, currency: 'CAD', description: 'A global centre for research and teaching, top-40 worldwide.', eligibility: { min_cgpa: 3.4, ielts: 6.5, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['Science', 'Engineering', 'Business'], scholarships: [{ name: 'International Leader of Tomorrow Award', details: 'Full or partial tuition', coverage: 'Partial/Full' }], website: 'https://ubc.ca', isActive: true },
      { name: 'University of Toronto', country: 'Canada', city: 'Toronto', ranking: 25, fees: 38000, living_cost: 17000, currency: 'CAD', description: "Canada's top-ranked, most globally recognized university.", eligibility: { min_cgpa: 3.5, ielts: 7.0, entry_test: 'None' }, visa_time: '2-4 Months (Study Permit)', courses: ['Computer Science', 'Engineering', 'Business'], scholarships: [{ name: 'Lester B. Pearson Scholarship', details: 'Full tuition + living expenses', coverage: 'Full' }], website: 'https://utoronto.ca', isActive: true },

      // ===================== AUSTRALIA =====================
      { name: 'Federation University Australia', country: 'Australia', city: 'Ballarat', ranking: 999, fees: 22000, living_cost: 15000, currency: 'AUD', description: 'Affordable regional university with high visa approval rate.', eligibility: { min_cgpa: 2.5, ielts: 6.0, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['IT', 'Business', 'Engineering'], scholarships: [{ name: 'International Student Scholarship', details: '20% tuition reduction', coverage: 'Partial' }], website: 'https://federation.edu.au', isActive: true },
      { name: 'Central Queensland University', country: 'Australia', city: 'Rockhampton', ranking: 999, fees: 21000, living_cost: 14000, currency: 'AUD', description: 'Practical, career-focused programs with regional visa benefits.', eligibility: { min_cgpa: 2.5, ielts: 6.0, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['Business', 'Nursing', 'IT'], scholarships: [{ name: 'CQU International Award', details: '10-20% tuition reduction', coverage: 'Partial' }], website: 'https://cqu.edu.au', isActive: true },
      { name: 'Deakin University', country: 'Australia', city: 'Melbourne', ranking: 251, fees: 30000, living_cost: 16000, currency: 'AUD', description: 'Innovative university with strong industry connections.', eligibility: { min_cgpa: 2.8, ielts: 6.5, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['Business', 'IT', 'Engineering'], scholarships: [{ name: 'Vice-Chancellor International Scholarship', details: '25-100% tuition reduction', coverage: 'Partial/Full' }], website: 'https://deakin.edu.au', isActive: true },
      { name: 'RMIT University', country: 'Australia', city: 'Melbourne', ranking: 140, fees: 33000, living_cost: 17000, currency: 'AUD', description: 'Global leader in design, technology and business.', eligibility: { min_cgpa: 2.8, ielts: 6.5, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['Computer Science', 'Design', 'Business'], scholarships: [{ name: 'RMIT Global Excellence Award', details: '25% tuition reduction', coverage: 'Partial' }], website: 'https://rmit.edu.au', isActive: true },
      { name: 'Macquarie University', country: 'Australia', city: 'Sydney', ranking: 130, fees: 34000, living_cost: 18000, currency: 'AUD', description: 'Research-intensive university close to Sydney tech hub.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['Business', 'Computer Science', 'Media'], scholarships: [{ name: "Vice-Chancellor's International Scholarship", details: '10-50% tuition reduction', coverage: 'Partial' }], website: 'https://mq.edu.au', isActive: true },
      { name: 'University of Adelaide', country: 'Australia', city: 'Adelaide', ranking: 89, fees: 32000, living_cost: 15000, currency: 'AUD', description: 'Group of Eight member with strong research reputation.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['Engineering', 'Computer Science', 'Business'], scholarships: [{ name: 'Adelaide Global Citizens Scholarship', details: '20% tuition reduction', coverage: 'Partial' }], website: 'https://adelaide.edu.au', isActive: true },
      { name: 'Monash University', country: 'Australia', city: 'Melbourne', ranking: 42, fees: 38000, living_cost: 18000, currency: 'AUD', description: "Australia's largest university, strong in engineering and IT.", eligibility: { min_cgpa: 3.2, ielts: 6.5, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['Engineering', 'IT', 'Business'], scholarships: [{ name: 'Monash International Merit Scholarship', details: '25% tuition reduction', coverage: 'Partial' }], website: 'https://monash.edu', isActive: true },
      { name: 'University of Queensland', country: 'Australia', city: 'Brisbane', ranking: 43, fees: 36000, living_cost: 16000, currency: 'AUD', description: 'Group of Eight university with global research standing.', eligibility: { min_cgpa: 3.2, ielts: 6.5, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['Engineering', 'Business', 'Computer Science'], scholarships: [{ name: 'UQ International Excellence Scholarship', details: '25% tuition for full program', coverage: 'Partial' }], website: 'https://uq.edu.au', isActive: true },
      { name: 'University of New South Wales (UNSW)', country: 'Australia', city: 'Sydney', ranking: 19, fees: 39000, living_cost: 18000, currency: 'AUD', description: 'Top-20 global university, strong in engineering and tech.', eligibility: { min_cgpa: 3.3, ielts: 6.5, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['Computer Science', 'Engineering', 'Business'], scholarships: [{ name: 'UNSW Scientia Scholarship', details: 'Full tuition + living stipend', coverage: 'Full' }], website: 'https://unsw.edu.au', isActive: true },
      { name: 'University of Sydney', country: 'Australia', city: 'Sydney', ranking: 18, fees: 40000, living_cost: 19000, currency: 'AUD', description: "Australia's oldest and most prestigious university.", eligibility: { min_cgpa: 3.3, ielts: 6.5, entry_test: 'None' }, visa_time: '4-8 Weeks (Subclass 500 Visa)', courses: ['Business', 'Law', 'Computer Science'], scholarships: [{ name: 'Sydney International Scholarship', details: 'Up to 50% tuition reduction', coverage: 'Partial' }], website: 'https://sydney.edu.au', isActive: true },

      // ===================== GERMANY =====================
      { name: 'Technical University of Munich', country: 'Germany', city: 'Munich', ranking: 28, fees: 0, living_cost: 12000, currency: 'EUR', description: "Germany's top technical university, renowned for engineering and applied sciences.", eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'TestAS (Optional)' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Engineering', 'Computer Science', 'Physics'], scholarships: [{ name: 'DAAD Scholarship', details: 'Full tuition + monthly stipend', coverage: 'Full' }], website: 'https://tum.de', isActive: true },
      { name: 'RWTH Aachen University', country: 'Germany', city: 'Aachen', ranking: 106, fees: 0, living_cost: 10000, currency: 'EUR', description: "Germany's largest technical university, strong industry connections.", eligibility: { min_cgpa: 2.8, ielts: 6.0, entry_test: 'None' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Mechanical Engineering', 'Computer Science', 'Electrical Engineering'], scholarships: [{ name: 'RWTH Merit Scholarship', details: 'Partial living cost support', coverage: 'Partial' }], website: 'https://rwth-aachen.de', isActive: true },
      { name: 'Ludwig Maximilian University of Munich (LMU)', country: 'Germany', city: 'Munich', ranking: 59, fees: 0, living_cost: 12500, currency: 'EUR', description: 'One of the oldest and most prestigious research universities in Europe.', eligibility: { min_cgpa: 3.2, ielts: 6.5, entry_test: 'None' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Medicine', 'Law', 'Computer Science'], scholarships: [{ name: 'LMU Merit Scholarship', details: 'Monthly stipend for top applicants', coverage: 'Partial' }], website: 'https://lmu.de', isActive: true },
      { name: 'Heidelberg University', country: 'Germany', city: 'Heidelberg', ranking: 87, fees: 0, living_cost: 11500, currency: 'EUR', description: "Germany's oldest university with a strong global research reputation.", eligibility: { min_cgpa: 3.2, ielts: 6.5, entry_test: 'None' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Medicine', 'Natural Sciences', 'Law'], scholarships: [{ name: 'Heidelberg Graduate Academy Scholarship', details: 'Partial funding for research students', coverage: 'Partial' }], website: 'https://uni-heidelberg.de', isActive: true },
      { name: 'Humboldt University of Berlin', country: 'Germany', city: 'Berlin', ranking: 120, fees: 0, living_cost: 11000, currency: 'EUR', description: 'A leading research university in the heart of Berlin.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Social Sciences', 'Computer Science', 'Law'], scholarships: [{ name: 'Deutschlandstipendium', details: 'Monthly merit-based stipend', coverage: 'Partial' }], website: 'https://hu-berlin.de', isActive: true },
      { name: 'University of Stuttgart', country: 'Germany', city: 'Stuttgart', ranking: 315, fees: 0, living_cost: 10500, currency: 'EUR', description: 'Strong engineering-focused university, close to major automotive industries.', eligibility: { min_cgpa: 2.8, ielts: 6.0, entry_test: 'None' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Mechanical Engineering', 'Computer Science', 'Automotive Engineering'], scholarships: [{ name: 'Stuttgart International Scholarship', details: 'Partial living cost support', coverage: 'Partial' }], website: 'https://uni-stuttgart.de', isActive: true },
      { name: 'Technical University of Berlin (TU Berlin)', country: 'Germany', city: 'Berlin', ranking: 154, fees: 0, living_cost: 11500, currency: 'EUR', description: 'Top technical university known for engineering and innovation.', eligibility: { min_cgpa: 2.8, ielts: 6.0, entry_test: 'None' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Engineering', 'Computer Science', 'Industrial Design'], scholarships: [{ name: 'TU Berlin International Scholarship', details: 'Partial tuition-related cost support', coverage: 'Partial' }], website: 'https://tu.berlin', isActive: true },
      { name: 'University of Bonn', country: 'Germany', city: 'Bonn', ranking: 210, fees: 0, living_cost: 10000, currency: 'EUR', description: 'Renowned for mathematics, economics, and life sciences.', eligibility: { min_cgpa: 2.8, ielts: 6.0, entry_test: 'None' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Mathematics', 'Economics', 'Computer Science'], scholarships: [{ name: 'Bonn International Scholarship', details: 'Partial funding for outstanding students', coverage: 'Partial' }], website: 'https://uni-bonn.de', isActive: true },
      { name: 'Karlsruhe Institute of Technology (KIT)', country: 'Germany', city: 'Karlsruhe', ranking: 132, fees: 0, living_cost: 10500, currency: 'EUR', description: 'Elite research and technology institute, strong in engineering and IT.', eligibility: { min_cgpa: 3.0, ielts: 6.5, entry_test: 'None' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Computer Science', 'Engineering', 'Physics'], scholarships: [{ name: 'KIT Merit Scholarship', details: 'Monthly stipend for top students', coverage: 'Partial' }], website: 'https://kit.edu', isActive: true },
      { name: 'University of Freiburg', country: 'Germany', city: 'Freiburg', ranking: 233, fees: 0, living_cost: 10000, currency: 'EUR', description: 'Historic university known for strong life sciences and environmental research.', eligibility: { min_cgpa: 2.8, ielts: 6.0, entry_test: 'None' }, visa_time: '6-12 Weeks (National D Visa)', courses: ['Environmental Science', 'Medicine', 'Computer Science'], scholarships: [{ name: 'Freiburg Welcome Scholarship', details: 'One-time settlement grant', coverage: 'Partial' }], website: 'https://uni-freiburg.de', isActive: true },
    ];

    await University.insertMany(universities);
    res.status(201).json({ success: true, message: `Seeded ${universities.length} universities across Pakistan, USA, UK, Canada, Australia` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};