const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/user');
const nodemailer = require('nodemailer');

// Email Transporter Helper
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

// Send Status Notification Email
const sendStatusEmail = async (userEmail, userName, uniName, status) => {
  const colors = { 
    accepted: '#22c55e', 
    rejected: '#ef4444', 
    under_review: '#f59e0b', 
    submitted: '#6366f1', 
    waitlisted: '#8b5cf6' 
  };
  const color = colors[status] || '#6366f1';
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"StudyAbroad.ai" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Application Update: ${uniName}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:auto;background:#0a0f1e;color:white;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:30px;text-align:center;">
          <h1 style="margin:0;">🌍 StudyAbroad.ai</h1>
        </div>
        <div style="padding:30px;">
          <h2>Hi ${userName},</h2>
          <p style="color:#94a3b8;">Your application to <strong style="color:white;">${uniName}</strong> has been updated.</p>
          <div style="background:#1e293b;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
            <span style="font-size:24px;font-weight:900;color:${color};text-transform:uppercase;">${status.replace('_', ' ')}</span>
          </div>
          <p style="color:#64748b;font-size:13px;">Log in to your dashboard to view full details.</p>
        </div>
      </div>`,
  });
};

// Demo/Fallback Data for Offline Mode
const fallbackApplications = [
  { 
    _id: 'demo-app-1', 
    universityId: { _id: 'demo-1', name: 'University of Oxford', country: 'UK', city: 'Oxford' }, 
    program: 'Computer Science', 
    status: 'submitted', 
    createdAt: new Date().toISOString(), 
    academicInfo: { cgpa: 3.8, ielts: 7.5 }, 
    notes: 'Demo application created for preview.' 
  },
  { 
    _id: 'demo-app-2', 
    universityId: { _id: 'demo-2', name: 'Technical University of Munich', country: 'Germany', city: 'Munich' }, 
    program: 'Engineering', 
    status: 'under_review', 
    createdAt: new Date(Date.now() - 86400000).toISOString(), 
    academicInfo: { cgpa: 3.3, ielts: 6.5 }, 
    notes: 'Under review in demo mode.' 
  },
];

// 1. Submit Application (Fixed for Server Error 500 & Payload Mapping)
exports.createApplication = async (req, res) => {
  try {
    // Extract exact user ID whether req.user is an object or string ID
    const userId = req.user && req.user._id ? req.user._id : req.user;

    const { 
      universityId, 
      intendedProgram, 
      program, 
      intendedStartDate, 
      cgpa, 
      testScore, 
      notes 
    } = req.body;

    // Demo Mode Handler
    if (!process.env.MONGO_URI || process.env.DB_CONNECTED !== 'true') {
      return res.status(201).json({ 
        success: true, 
        data: { 
          ...req.body, 
          _id: `demo-app-${Date.now()}`, 
          userId, 
          status: 'submitted', 
          createdAt: new Date().toISOString(), 
          universityId: { _id: universityId, name: 'Demo University', country: 'Global' } 
        } 
      });
    }

    // Check for existing active application
    const existing = await Application.findOne({ 
      userId, 
      universityId, 
      status: { $nin: ['rejected'] } 
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have an active application to this university' });
    }

    // Create Application Entry with schema fields mapping
    const application = await Application.create({
      userId,
      universityId,
      program: program || intendedProgram || 'Not Specified',
      intendedStartDate,
      academicInfo: {
        cgpa: cgpa || 0,
        testScore: testScore || ''
      },
      notes: notes || '',
      status: 'submitted'
    });

    // In-App Notification
    await Notification.create({
      userId,
      type: 'status_change',
      title: 'Application Submitted',
      body: `Your application has been submitted successfully.`,
      link: `/applications/${application._id}`,
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    console.error("CREATE APPLICATION ERROR:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// 2. Get My Applications
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : req.user;

    if (!process.env.MONGO_URI || process.env.DB_CONNECTED !== 'true') {
      const { status } = req.query;
      const filtered = fallbackApplications.filter((app) => !status || app.status === status);
      return res.status(200).json({ success: true, data: filtered });
    }

    const { status } = req.query;
    const filter = { userId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('universityId', 'name country city ranking fees logo')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("GET MY APPLICATIONS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Get Single Application
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('universityId', 'name country city ranking fees logo eligibility')
      .populate('userId', 'name email profilePicture');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("GET APPLICATION ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Update Application Status (Admin/Counselor) - SAFE EMAIL TRIGGER
exports.updateStatus = async (req, res) => {
  try {
    const { status, internalNotes } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, ...(internalNotes && { internalNotes }) },
      { new: true }
    ).populate('userId', 'name email emailNotifications').populate('universityId', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // In-App Notification
    await Notification.create({
      userId: application.userId._id,
      type: 'status_change',
      title: 'Application Status Updated',
      body: `Your application to ${application.universityId.name} is now: ${status.replace('_', ' ').toUpperCase()}`,
      link: `/applications/${application._id}`,
    });

    // Send Email (Safe Try/Catch)
    try {
      const allowEmail = application.userId.emailNotifications !== false;
      if (allowEmail && application.userId.email) {
        await sendStatusEmail(
          application.userId.email,
          application.userId.name || 'Student',
          application.universityId.name || 'University',
          status
        );
      }
    } catch (emailErr) {
      console.error('Email sending failed, but status was updated:', emailErr.message);
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 5. Get All Applications (Admin)
exports.getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('userId', 'name email profilePicture')
        .populate('universityId', 'name country city')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(filter),
    ]);

    res.status(200).json({ 
      success: true, 
      data: applications, 
      total, 
      page: Number(page), 
      pages: Math.ceil(total / Number(limit)) 
    });
  } catch (error) {
    console.error("GET ALL APPLICATIONS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// 6. Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : req.user;

    if (!process.env.MONGO_URI || process.env.DB_CONNECTED !== 'true') {
      const recent = fallbackApplications.slice(0, 2);
      return res.status(200).json({ 
        success: true, 
        data: { 
          total: fallbackApplications.length, 
          accepted: 0, 
          pending: fallbackApplications.filter((a) => a.status === 'submitted').length, 
          underReview: fallbackApplications.filter((a) => a.status === 'under_review').length, 
          recent 
        } 
      });
    }

    const [total, accepted, pending, underReview] = await Promise.all([
      Application.countDocuments({ userId }),
      Application.countDocuments({ userId, status: 'accepted' }),
      Application.countDocuments({ userId, status: 'submitted' }),
      Application.countDocuments({ userId, status: 'under_review' }),
    ]);

    const recent = await Application.find({ userId })
      .populate('universityId', 'name country city ranking fees logo')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({ 
      success: true, 
      data: { total, accepted, pending, underReview, recent } 
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};