const Groq = require('groq-sdk');
const NodeCache = require('node-cache');
const University = require('../models/University');

const cache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });

// ─── Shared Helper to Clean & Parse JSON ─────────────────────────────────────
const safeJSONParse = (rawText) => {
  try {
    const clean = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parsing Error:", e.message);
    return null;
  }
};

// ─── Groq API Request Engine ──────────────────────────────────────────────────
const askGPT = async (messages, opts = {}) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is missing in env');

  const groq = new Groq({ apiKey });

  const formattedMessages = messages.map(m => ({
    role: m.role.toLowerCase() === 'system' ? 'system' : (m.role.toLowerCase() === 'user' ? 'user' : 'assistant'),
    content: m.content
  }));

  const completion = await groq.chat.completions.create({
    messages: formattedMessages,
    model: 'llama-3.3-70b-versatile',
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.max_tokens || 1500,
    ...(opts.json && { response_format: { type: 'json_object' } }),
  });

  return completion.choices[0]?.message?.content || '';
};

// ─── 1. AI CHATBOT ───────────────────────────────────────────────────────────
exports.chat = async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const system = `You are an elite study abroad counselor for StudyAbroad.ai. Provide precise guidance on admissions, visas, scholarships, and living costs. Use clear bullet points.`;
    const reply = await askGPT([{ role: 'system', content: system }, ...messages.slice(-10)], { max_tokens: 700 });
    res.json({ success: true, reply, isAI: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 2. AI ELIGIBILITY PREDICTOR (BS 2nd-Year vs MS CGPA Logic) ────────────────
exports.predictEligibility = async (req, res) => {
  try {
    const { 
      academicLevel = 'undergraduate', // 'undergraduate' (2nd Year/FSc) OR 'postgraduate' (MS)
      fscMarks, // Marks or percentage e.g., 85% or 935/1100 (for 2nd Year)
      cgpa,     // CGPA out of 4.0 (for MS applicants)
      ielts, 
      gre, 
      budget, 
      country, 
      program 
    } = req.body;

    const selectedCountry = country && country !== 'All' ? country : 'Global';
    const isUndergrad = academicLevel.toLowerCase() === 'undergraduate';

    // 1. Try DB Search First
    let filter = { isActive: true };
    if (selectedCountry !== 'Global') {
      filter.country = { $regex: new RegExp(`^${selectedCountry}$`, 'i') };
    }

    let universities = await University.find(filter).limit(15).lean();

    // 2. If DB has no specific unis, generate real ones via Groq
    if (!universities || universities.length === 0) {
      const studentMetrics = isUndergrad 
        ? `Academic Level: Undergraduate (Applying after 2nd Year / FSc), FSc/Intermediate Marks/Percentage: ${fscMarks || '80%'}`
        : `Academic Level: Postgraduate (Applying for MS/Master's), BS CGPA: ${cgpa || '3.0'}/4.0`;

      const prompt = `Return a JSON object with key "results" containing 5 REAL top universities in ${selectedCountry} offering ${isUndergrad ? 'Bachelor/BS' : 'Master/MS'} degrees in ${program || 'General Programs'}.

Student Profile:
- ${studentMetrics}
- IELTS: ${ielts || 'Not taken'}/9
- GRE: ${gre || 'N/A'}
- Budget: $${budget || 'Flexible'}/year

Strict JSON format required:
{
  "results": [
    {
      "university": { 
        "name": "Exact University Name", 
        "country": "${selectedCountry}", 
        "ranking": 100, 
        "fees": 20000 
      },
      "matchScore": 85,
      "likelihood": "High",
      "missing": ["List missing requirements based on ${isUndergrad ? 'FSc marks' : 'BS CGPA'}"],
      "tip": "Constructive advice for ${isUndergrad ? '2nd-year FSC applicant' : 'MS applicant'}",
      "strengths": ["Strong profile aspects"],
      "weaknesses": ["Profile gaps"]
    }
  ]
}`;

      const raw = await askGPT([{ role: 'user', content: prompt }], { json: true, max_tokens: 1500 });
      const parsed = safeJSONParse(raw);
      return res.json({ success: true, data: parsed?.results || [], isAI: true });
    }

    // 3. Match against DB Records if available
    const uniList = universities.map(u => 
      `${u.name}|${u.country}|${u.ranking}|${u.eligibility?.min_cgpa || 0}|${u.eligibility?.ielts || 0}|${u.fees || 0}`
    ).join('\n');

    const prompt = `Student Level: ${academicLevel} (${isUndergrad ? `FSc Marks: ${fscMarks}` : `BS CGPA: ${cgpa}`}), IELTS=${ielts}, Budget=$${budget}.
Target Country: ${selectedCountry}
Universities:\n${uniList}\n
Return JSON with key "results" array matching each university with matchScore(0-100), likelihood(High/Medium/Low), missing, tip, strengths, weaknesses.`;

    const raw = await askGPT([{ role: 'user', content: prompt }], { json: true });
    const parsed = safeJSONParse(raw);

    const results = universities.map(uni => {
      const ai = parsed?.results?.find(r => r.name?.toLowerCase().includes(uni.name.toLowerCase().split(' ')[0]));
      return {
        university: uni,
        matchScore: ai?.matchScore || 70,
        likelihood: ai?.likelihood || 'Medium',
        missing: ai?.missing || [],
        tip: ai?.tip || 'Ensure all educational certificates are attested.',
        strengths: ai?.strengths || ['Good Academic Standing'],
        weaknesses: ai?.weaknesses || []
      };
    });

    res.json({ success: true, data: results, isAI: true });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 3. AI SCHOLARSHIP MATCHER (Dynamic Country Fix) ─────────────────────────
exports.matchScholarships = async (req, res) => {
  try {
    const { academicLevel, fscMarks, cgpa, country, fieldOfStudy } = req.body;
    const targetCountry = country || 'Global';
    const isUndergrad = academicLevel?.toLowerCase() === 'undergraduate';

    const academicDetail = isUndergrad ? `FSc Marks: ${fscMarks || '80%'}` : `BS CGPA: ${cgpa || '3.0'}/4.0`;

    const prompt = `List 5 real and active scholarships specifically for international students applying for ${isUndergrad ? 'Bachelors/BS' : 'Masters/MS'} in ${targetCountry} studying ${fieldOfStudy || 'Higher Education'}.
Student Academic Detail: ${academicDetail}.

Return JSON with key "results":
{
  "results": [
    {
      "name": "Scholarship Name",
      "country": "${targetCountry}",
      "amount": 25000,
      "currency": "USD",
      "eligibilityCriteria": "Specific criteria",
      "deadline": "2026-11-01",
      "link": "https://official-link.com",
      "matchScore": 85,
      "reason": "Why it fits",
      "applicationTips": "How to win it",
      "strengthenProfile": "Actionable advice"
    }
  ]
}`;

    const raw = await askGPT([{ role: 'user', content: prompt }], { json: true, max_tokens: 1500 });
    const parsed = safeJSONParse(raw);
    res.json({ success: true, data: parsed?.results || [], isAI: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 4. AI SOP GENERATOR ─────────────────────────────────────────────────────
exports.generateSOP = async (req, res) => {
  try {
    const { name, university, program, cgpa, fscMarks, academicLevel, ielts, workExperience, achievements, whyProgram, whyUniversity, careerGoals, country } = req.body;

    const academicInfo = academicLevel === 'undergraduate' ? `FSc/2nd Year Marks: ${fscMarks}` : `BS CGPA: ${cgpa}/4.0`;

    const prompt = `Write a professional Statement of Purpose for ${name || 'the student'} applying for ${program} at ${university}, ${country}.
Academic Profile: ${academicInfo}, IELTS: ${ielts}, Work Exp: ${workExperience || 'None'}, Goals: ${careerGoals}, Reasons: ${whyProgram} & ${whyUniversity}.

Return JSON:
{
  "sop": "Full multi-paragraph SOP text...",
  "wordCount": 650,
  "strengthScore": 88,
  "improvements": ["Add more research specifics", "Quantify project results"]
}`;

    const raw = await askGPT([{ role: 'user', content: prompt }], { json: true, max_tokens: 2000 });
    const parsed = safeJSONParse(raw);
    res.json({ success: true, data: parsed || { sop: raw, wordCount: 500, strengthScore: 70, improvements: [] }, isAI: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 5. AI CAREER PREDICTOR ──────────────────────────────────────────────────
exports.predictCareerPath = async (req, res) => {
  try {
    const { program, country, academicLevel, interests, skills } = req.body;

    const prompt = `Provide career outcomes for a graduate of ${program} in ${country} (${academicLevel || 'Bachelors'}).
Interests=${interests}, Skills=${skills}.

Return JSON:
{
  "topCareers": [{ "title": "Role Title", "avgSalary": "$75,000/yr", "demandLevel": "High", "description": "Overview", "requiredSkills": ["Skill 1", "Skill 2"] }],
  "industryTrends": ["Trend 1", "Trend 2"],
  "salaryRange": { "entry": "$50,000", "mid": "$80,000", "senior": "$120,000" },
  "topCompanies": ["Company A", "Company B"],
  "certifications": ["Cert 1", "Cert 2"],
  "timelineToJob": "3-6 months post graduation",
  "remoteWorkPossibility": "High",
  "aiImpact": "Low automation risk"
}`;

    const raw = await askGPT([{ role: 'user', content: prompt }], { json: true, max_tokens: 1500 });
    const parsed = safeJSONParse(raw);
    res.json({ success: true, data: parsed || {}, isAI: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 6. AI COUNTRY COMPARISON ────────────────────────────────────────────────
exports.compareCountries = async (req, res) => {
  try {
    const { countries = ['UK', 'USA'], program, budget, academicLevel } = req.body;

    const prompt = `Compare studying ${program || 'Higher Education'} (${academicLevel || 'Bachelors'}) in: ${countries.join(' vs ')}.
Student Budget=$${budget}.

Return JSON with key "comparison":
{
  "comparison": [
    {
      "country": "Country Name",
      "overallScore": 85,
      "tuitionRange": "$15,000 - $25,000/yr",
      "livingCost": "$1,000/mo",
      "workRights": "20 hrs/week during term",
      "postStudyVisa": "2 Years PSWV",
      "jobMarket": "Strong tech/business sectors",
      "languageBarrier": "None",
      "safetyIndex": "Good",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1", "Con 2"],
      "bestFor": ["Target Student Type"],
      "visaSuccessRate": "85%",
      "averageIELTS": "6.5",
      "topUniversities": ["Uni 1", "Uni 2"]
    }
  ]
}`;

    const raw = await askGPT([{ role: 'user', content: prompt }], { json: true, max_tokens: 1800 });
    const parsed = safeJSONParse(raw);
    res.json({ success: true, data: parsed || { comparison: [] }, isAI: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 7. AI INTERVIEW PREP ────────────────────────────────────────────────────
exports.interviewPrep = async (req, res) => {
  try {
    const { university, program, country, visaType } = req.body;

    const prompt = `Provide interview prep for ${visaType || 'Student Visa'} to ${country} for ${program} at ${university}.

Return JSON:
{
  "likelyQuestions": [{ "question": "Sample Question?", "category": "Motivation", "sampleAnswer": "Ideal response...", "tips": "Key advice" }],
  "doList": ["Do 1", "Do 2"],
  "dontList": ["Don't 1", "Don't 2"],
  "dresscode": "Formal Business Attire",
  "documentChecklist": ["Doc 1", "Doc 2"],
  "commonMistakes": ["Mistake 1"],
  "confidenceBooster": "Key mindset advice"
}`;

    const raw = await askGPT([{ role: 'user', content: prompt }], { json: true, max_tokens: 1500 });
    const parsed = safeJSONParse(raw);
    res.json({ success: true, data: parsed || {}, isAI: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 8. AI BUDGET PLANNER ────────────────────────────────────────────────────
exports.planBudget = async (req, res) => {
  try {
    const { country, city, duration, tuitionFee, currency } = req.body;

    const prompt = `Detailed student living budget for ${city || country}.
Duration: ${duration || '1 year'}, Tuition: ${tuitionFee || 'Average'}, Currency: ${currency || 'USD'}.

Return JSON:
{
  "monthlyBreakdown": { "rent": 500, "food": 250, "transport": 80, "utilities": 70, "books": 40, "entertainment": 60, "health": 50, "misc": 50 },
  "totalMonthly": 1100,
  "totalAnnual": 13200,
  "savingTips": ["Tip 1", "Tip 2"],
  "partTimeWorkInfo": "Allowed 20 hrs/week at $12-15/hr",
  "cheapestNeighborhoods": ["Area 1", "Area 2"],
  "studentDiscounts": ["Discount 1", "Discount 2"],
  "emergencyFund": 1500,
  "currencySymbol": "$"
}`;

    const raw = await askGPT([{ role: 'user', content: prompt }], { json: true, max_tokens: 1200 });
    const parsed = safeJSONParse(raw);
    res.json({ success: true, data: parsed || {}, isAI: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 9. AI IELTS COACH ──────────────────────────────────────────────────────
exports.ieltsCoach = async (req, res) => {
  try {
    const { currentScore, targetScore, targetDate, weakAreas } = req.body;

    const prompt = `IELTS preparation roadmap. Current: ${currentScore || '6.0'}, Target: ${targetScore || '7.5'}, Target Date: ${targetDate || '2 months'}, Weak Areas: ${weakAreas || 'Writing & Speaking'}.

Return JSON:
{
  "studyPlan": [{ "week": 1, "focus": "Task 2 Writing Structure", "tasks": ["Task 1", "Task 2"], "hours": 12 }],
  "resourcesBySection": { "listening": ["Resource 1"], "reading": ["Resource 2"], "writing": ["Resource 3"], "speaking": ["Resource 4"] },
  "dailyRoutine": ["30 mins reading", "1 practice test"],
  "mockTestSchedule": "Every Saturday",
  "scoreImprovementTips": ["Tip 1", "Tip 2"],
  "estimatedReadyDate": "Within 8 weeks",
  "confidenceLevel": "High"
}`;

    const raw = await askGPT([{ role: 'user', content: prompt }], { json: true, max_tokens: 1500 });
    const parsed = safeJSONParse(raw);
    res.json({ success: true, data: parsed || {}, isAI: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 10. AI VISA GUIDE ───────────────────────────────────────────────────────
exports.getVisaGuide = async (req, res) => {
  try {
    const country = req.params.country || 'USA';

    const prompt = `Comprehensive student visa guide for ${country}.

Return JSON:
{
  "steps": ["Step 1", "Step 2"],
  "documents": ["Doc 1", "Doc 2"],
  "fees": "$500",
  "processingTime": "4-8 Weeks",
  "tips": ["Tip 1"],
  "rejectionReasons": ["Reason 1"],
  "postStudyWork": "Details...",
  "workRightsDuringStudy": "20 hrs/wk",
  "costOfLiving": "Medium"
}`;

    const raw = await askGPT([{ role: 'user', content: prompt }], { json: true, max_tokens: 1200 });
    const parsed = safeJSONParse(raw);
    res.json({ success: true, data: parsed || {}, isAI: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};