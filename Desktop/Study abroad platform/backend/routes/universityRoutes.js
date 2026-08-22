const express = require('express');
const router = express.Router();
const {
  getAllUniversities,
  getUniversityById,
  addUniversity,
  updateUniversity,
  deleteUniversity,
  seedUniversities,
} = require('../controllers/universityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllUniversities);
router.get('/seed', seedUniversities); // Dev helper
router.get('/:id', getUniversityById);
router.post('/add', protect, authorize('admin'), addUniversity);
router.put('/:id', protect, authorize('admin'), updateUniversity);
router.delete('/:id', protect, authorize('admin'), deleteUniversity);

module.exports = router;
