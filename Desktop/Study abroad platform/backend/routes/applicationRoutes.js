const express = require('express');
const router = express.Router();
const {
  createApplication, getMyApplications, getApplication,
  updateStatus, getAllApplications, getDashboardStats,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createApplication);
router.get('/', protect, getMyApplications);
router.get('/stats', protect, getDashboardStats);
router.get('/admin/all', protect, authorize('admin', 'counselor'), getAllApplications);
router.get('/:id', protect, getApplication);
router.put('/:id/status', protect, authorize('admin', 'counselor'), updateStatus);

module.exports = router;
