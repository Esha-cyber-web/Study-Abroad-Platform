const User = require('../models/user');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// ─── Helpers ────────────────────────────────────────────────────────────────

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"StudyAbroad.ai" <${process.env.EMAIL_USER}>`,
    to, subject, html,
  });
};

const otpEmailTemplate = (otp, purpose = 'verification') => `
  <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:auto;background:#0a0f1e;color:white;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:30px;text-align:center;">
      <h1 style="margin:0;font-size:28px;">🌍 StudyAbroad.ai</h1>
    </div>
    <div style="padding:30px;text-align:center;">
      <h2 style="color:#a855f7;">Email ${purpose === 'reset' ? 'Password Reset' : 'Verification'}</h2>
      <p style="color:#94a3b8;">Use the code below to ${purpose === 'reset' ? 'reset your password' : 'verify your email'}:</p>
      <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0;letter-spacing:12px;font-size:32px;font-weight:900;color:#6366f1;">${otp}</div>
      <p style="color:#64748b;font-size:13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  </div>`;

// ─── Controllers ────────────────────────────────────────────────────────────

// 1. Send OTP (Registration)
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) return res.status(400).json({ message: 'An account with this email already exists' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
      { email: cleanEmail },
      { otp: otpCode, createdAt: Date.now() },
      { upsert: true }
    );
    await sendEmail(cleanEmail, 'Your StudyAbroad.ai Verification Code', otpEmailTemplate(otpCode));
    res.status(200).json({ message: 'OTP sent to your email!' });
  } catch (error) {
    console.error('sendOTP error:', error.message);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};

// 2. Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ name, email, password: hashedPassword });
    await OTP.deleteOne({ email });

    const token = generateToken(newUser._id, newUser.role);
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) return res.status(400).json({ message: 'No account found with this email' });
    if (user.isBanned) return res.status(403).json({ message: 'Your account has been suspended' });
    if (!user.password) return res.status(400).json({ message: 'Please use Google or GitHub to sign in' });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Incorrect password' });

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Forgot Password — Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
      { email: cleanEmail },
      { otp: otpCode, createdAt: Date.now() },
      { upsert: true }
    );
    await sendEmail(cleanEmail, 'Reset Your StudyAbroad.ai Password', otpEmailTemplate(otpCode, 'reset'));
    res.status(200).json({ message: 'Password reset OTP sent to your email!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reset OTP. Please try again.' });
  }
};

// 5. Reset Password — Verify OTP + Update
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await OTP.deleteOne({ email });
    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Google OAuth
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId, profilePicture: picture, password: null });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.profilePicture) user.profilePicture = picture;
      await user.save();
    }

    if (user.isBanned) return res.status(403).json({ message: 'Your account has been suspended' });

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      message: 'Google login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture },
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

// 7. GitHub OAuth Callback
exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code },
      { headers: { Accept: 'application/json' } }
    );
    const accessToken = tokenRes.data.access_token;

    const [userRes, emailsRes] = await Promise.all([
      axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}` } }),
      axios.get('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}` } }),
    ]);

    const githubUser = userRes.data;
    const primaryEmail = emailsRes.data.find((e) => e.primary)?.email || emailsRes.data[0]?.email;

    let user = await User.findOne({ email: primaryEmail });
    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email: primaryEmail,
        githubId: String(githubUser.id),
        profilePicture: githubUser.avatar_url,
        password: null,
      });
    }

    if (user.isBanned) return res.redirect(`${process.env.CLIENT_URL}/login?error=banned`);

    const token = generateToken(user._id, user.role);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&role=${user.role}&pic=${encodeURIComponent(user.profilePicture || '')}`);
  } catch (error) {
    console.error('GitHub auth error:', error.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=github_failed`);
  }
};

// 8. Get Profile
exports.getProfile = async (req, res) => {
  try {
    if (req.isDev) {
      return res.status(200).json({
        success: true,
        data: {
          _id: req.user,
          name: 'Dev User',
          email: 'dev@test.com',
          role: 'admin',
          cgpa: 3.8,
          ielts: 7.5,
          budget: 50000,
          profilePicture: 'https://ui-avatars.com/api/?name=Dev+User&background=6366f1&color=fff',
          favorites: []
        }
      });
    }

    const user = await User.findById(req.user).select('-password').populate('favorites', 'name country city ranking fees');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 9. Update Profile
exports.updateProfile = async (req, res) => {
  try {
    if (req.isDev) {
      const { name, phone, country, profilePicture, cgpa, ielts, budget, preferredCountry, emailNotifications } = req.body;
      return res.status(200).json({
        success: true,
        data: {
          _id: req.user,
          name: name || 'Dev User',
          email: 'dev@test.com',
          role: 'admin',
          cgpa: cgpa || 3.8,
          ielts: ielts || 7.5,
          budget: budget || 50000,
          phone,
          country,
          profilePicture: profilePicture || 'https://ui-avatars.com/api/?name=Dev+User&background=6366f1&color=fff',
          preferredCountry,
          emailNotifications: emailNotifications !== false
        }
      });
    }

    const { name, phone, country, profilePicture, cgpa, ielts, budget, preferredCountry, emailNotifications } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user,
      { name, phone, country, profilePicture, cgpa, ielts, budget, preferredCountry, emailNotifications },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 10. Toggle Favorite (FIXED: Supports Dev Mode + Safe ID Matching)
exports.toggleFavorite = async (req, res) => {
  try {
    const uniId = req.params.uniId || req.params.universityId || req.body.universityId;

    if (!uniId) {
      return res.status(400).json({ success: false, message: 'University ID is required' });
    }

    // DEVELOPMENT MODE HANDLER
    if (req.isDev) {
      return res.status(200).json({
        success: true,
        favorites: [uniId],
        message: 'Dev mode: Favorite updated successfully'
      });
    }

    const userId = req.user && req.user._id ? req.user._id : req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    // Safe string comparison for MongoDB ObjectIds
    const idx = user.favorites.findIndex(
      (id) => id.toString() === uniId.toString()
    );

    if (idx === -1) {
      user.favorites.push(uniId);
    } else {
      user.favorites.splice(idx, 1);
    }

    await user.save();
    return res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.error('TOGGLE FAVORITE ERROR:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};