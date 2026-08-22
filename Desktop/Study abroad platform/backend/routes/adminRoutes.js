const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Application');
const University = require('../models/University');
const { protect, authorize } = require('../middleware/authMiddleware');
const sendStatusEmail = require('../utils/sendEmail');

const adminOnly = [protect, authorize('admin')];

// 1. GET /api/admin/stats
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalApps, pendingApps, acceptedApps] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Application.countDocuments({}),
      Application.countDocuments({ 
        status: { $in: ['submitted', 'under_review', 'Submitted', 'Under Review', 'Pending Review'] } 
      }),
      Application.countDocuments({ 
        status: { $in: ['accepted', 'Accepted'] } 
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalApps,
        pendingApps,
        acceptedApps
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/admin/applications
router.get('/applications', adminOnly, async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('userId', 'name email profilePicture')
      .populate('universityId', 'name country')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. PATCH /api/admin/applications/:id (Status Update & Email Notification)
router.patch('/applications/:id', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    
    let application = await Application.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('universityId', 'name');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    
    // Status history timeline update
    if (!application.statusHistory) {
      application.statusHistory = [];
    }
    application.statusHistory.push({
      status: status,
      updatedAt: new Date()
    });

    // Resolve Student email & details
    let studentEmail = application.userId?.email;
    let studentName = application.userId?.name;

    // Fallback: Agar missing/null userId ho to recent student auto-link karein
    if (!studentEmail) {
      const fallbackUser = await User.findOne({ role: 'student' }).sort({ createdAt: -1 });
      if (fallbackUser) {
        studentEmail = fallbackUser.email;
        studentName = fallbackUser.name;
        application.userId = fallbackUser._id;
      }
    }

    await application.save();

    const universityName = application.universityId?.name || 'University';

    console.log('\n=== EMAIL DISPATCH DEBUG LOG ===');
    console.log('Target Student Email:', studentEmail || 'NOT FOUND');

    if (studentEmail) {
      try {
        console.log(`Sending status email to ${studentEmail}...`);
        await sendStatusEmail(
          studentEmail,
          studentName || 'Student',
          status,
          universityName
        );
        console.log('SUCCESS: Status update email sent successfully!');
      } catch (emailErr) {
        console.error('NODEMAILER ERROR:', emailErr.message);
      }
    } else {
      console.log('WARNING: No student user found in system to dispatch email.');
    }
    console.log('=================================\n');

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('PATCH ROUTE ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Users List
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.status(200).json({ success: true, data: users, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Role
router.put('/users/:id/role', adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ban/Unban User
router.put('/users/:id/ban', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBanned = !user.isBanned;
    await user.save();
    res.status(200).json({ success: true, isBanned: user.isBanned });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;