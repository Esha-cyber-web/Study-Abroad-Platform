const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Helper wrapper to safely register routes and avoid undefined handler crashes
const safeRoute = (method, path, handlerName) => {
  if (typeof aiController[handlerName] === 'function') {
    router[method](path, aiController[handlerName]);
  } else {
    // Fallback handler if function is missing in controller
    router[method](path, (req, res) => {
      res.status(501).json({
        success: false,
        message: `Function '${handlerName}' is not implemented in aiController.js`
      });
    });
  }
};

// ─── AI Routes ───────────────────────────────────────────────────────────────
safeRoute('post', '/chat', 'chat');
safeRoute('post', '/predict-eligibility', 'predictEligibility');
safeRoute('get', '/visa-guide/:country', 'getVisaGuide');
safeRoute('post', '/match-scholarships', 'matchScholarships');
safeRoute('post', '/generate-sop', 'generateSOP');
safeRoute('post', '/predict-career', 'predictCareerPath');
safeRoute('post', '/compare-countries', 'compareCountries');
safeRoute('post', '/interview-prep', 'interviewPrep');
safeRoute('post', '/plan-budget', 'planBudget');
safeRoute('post', '/ielts-coach', 'ieltsCoach');

module.exports = router;