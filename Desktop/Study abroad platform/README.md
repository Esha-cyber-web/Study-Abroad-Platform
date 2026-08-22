# StudyAbroad.ai — Enterprise Study Abroad Platform

## 🌍 Overview

**StudyAbroad.ai** is a full-stack AI-powered study abroad guidance platform built with the MERN stack. Students discover universities, check eligibility with AI, track applications, and get personalized guidance — all in one place.

---

## ✨ Features Implemented

### 🔐 Authentication & User Management
- ✅ Email/Password registration with OTP verification
- ✅ Login with JWT authentication (7-day expiry)
- ✅ Google OAuth integration (frontend + backend)
- ✅ GitHub OAuth integration (frontend + backend)
- ✅ Forgot Password with OTP reset flow
- ✅ User profile management (CGPA, IELTS, budget, preferences)
- ✅ Role-based access control (Student, Counselor, Admin)
- ✅ Session persistence (auto-restore on page refresh)

### 🎓 University Discovery
- ✅ 12 pre-seeded universities (Oxford, Harvard, TU Munich, ETH Zurich, etc.)
- ✅ Advanced filtering: country, budget slider, scholarships, ranking, IELTS
- ✅ Real-time search (name, city, country, description)
- ✅ Pagination + infinite scroll
- ✅ Favorites/bookmarking system (saved to user profile)
- ✅ Detailed university pages with fees, courses, eligibility, scholarships
- ✅ Currency converter (USD → PKR, INR, EUR, GBP)
- ✅ Document checklist per country

### 🤖 AI-Powered Features
- ✅ **AI Eligibility Predictor** — CGPA + IELTS + budget → ranked universities with acceptance probability
- ✅ **AI Chatbot** — Real conversational assistant (OpenAI GPT-4o-mini) with fallback to rule-based responses
- ✅ **AI Scholarship Matcher** — Profile-based scholarship recommendations
- ✅ **AI Visa Guide** — Country-specific step-by-step visa guides (UK, USA, Germany, Canada, Australia)
- ✅ Smart fallback system when OpenAI API key is not configured

### 📋 Application Tracking
- ✅ Submit applications to universities
- ✅ Application status pipeline: Draft → Submitted → Under Review → Accepted/Rejected/Waitlisted
- ✅ Visual progress stepper for each application
- ✅ Dashboard with stats (total, accepted, pending, under review)
- ✅ Email notifications on status changes
- ✅ Application history with filters

### 🔔 Notifications & Communication
- ✅ In-app notification center (bell icon with unread count)
- ✅ Email notifications (application updates, deadlines)
- ✅ Real-time notification polling (every 30 seconds)
- ✅ Mark all as read functionality

### 🎨 UI/UX
- ✅ Modern glassmorphism design with Framer Motion animations
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Dark gradient hero sections
- ✅ Smooth page transitions
- ✅ Toast notifications (react-hot-toast)
- ✅ Loading skeletons and shimmer effects
- ✅ Sticky navigation with user menu
- ✅ Floating AI chatbot widget

### 🔒 Security & Performance
- ✅ Rate limiting (auth: 20 req/15min, AI: 30 req/hour)
- ✅ Helmet security headers
- ✅ Input validation (express-validator)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ JWT with role-based authorization
- ✅ CORS configuration
- ✅ Global error handler
- ✅ MongoDB indexes for fast queries
- ✅ API response caching (disabled temporarily for debugging)

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite 8** — Lightning-fast dev server
- **React Router DOM 7** — Client-side routing
- **Framer Motion 12** — Smooth animations
- **TailwindCSS 4** — Utility-first styling
- **Axios** — HTTP client
- **React Hot Toast** — Beautiful notifications
- **Typed.js** — Typewriter effect
- **@react-oauth/google** — Google OAuth

### Backend
- **Node.js** + **Express 5** — REST API
- **MongoDB** + **Mongoose 9** — Database
- **JWT** — Authentication
- **Bcrypt** — Password hashing
- **Nodemailer** — Email (OTP, notifications)
- **OpenAI API** — AI features
- **Google Auth Library** — Google OAuth verification
- **Express Rate Limit** — API protection
- **Helmet** — Security headers
- **Morgan** — HTTP logging
- **Node-Cache** — In-memory caching

---

## 📁 Project Structure

```
Study abroad platform/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Auth logic (register, login, OAuth, OTP)
│   │   ├── universityController.js  # University CRUD + seed
│   │   ├── applicationController.js # Application tracking
│   │   └── aiController.js          # AI features (chat, eligibility, visa, scholarships)
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT protect + role authorization
│   ├── models/
│   │   ├── user.js                  # User schema (extended with favorites, profile)
│   │   ├── University.js            # University schema (with eligibility, fees)
│   │   ├── Application.js           # Application schema (with status pipeline)
│   │   ├── Notification.js          # Notification schema
│   │   ├── Message.js               # Messaging schema
│   │   ├── Scholarship.js           # Scholarship schema
│   │   └── OTP.js                   # OTP schema (auto-expires in 5 min)
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── universityRoutes.js      # /api/universities/*
│   │   ├── applicationRoutes.js     # /api/applications/*
│   │   ├── aiRoutes.js              # /api/ai/*
│   │   ├── notificationRoutes.js    # /api/notifications/*
│   │   └── adminRoutes.js           # /api/admin/*
│   ├── .env                         # Environment variables
│   ├── server.js                    # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Sticky nav with notifications + user menu
    │   │   ├── Footer.jsx           # Footer
    │   │   ├── UniversityCard.jsx   # University card with favorite button
    │   │   ├── ProtectedRoute.jsx   # Route guard
    │   │   ├── ChatWidget.jsx       # Floating AI chatbot
    │   │   └── AdvancedFeatures.jsx # AdmissionPredictor, DocumentChecklist, CurrencyConverter
    │   ├── context/
    │   │   └── AuthContext.jsx      # Global auth state
    │   ├── pages/
    │   │   ├── Welcome.jsx          # Landing page (animated)
    │   │   ├── Login.jsx            # Login with Google/GitHub
    │   │   ├── Register.jsx         # OTP-based registration
    │   │   ├── ForgotPassword.jsx   # 3-step password reset
    │   │   ├── Dashboard.jsx        # Student dashboard with stats
    │   │   ├── Home.jsx             # University listing with filters
    │   │   ├── Assessment.jsx       # AI eligibility predictor
    │   │   ├── UniversityDetail.jsx # Detailed university page + apply modal
    │   │   ├── Applications.jsx     # Application tracking
    │   │   ├── Scholarships.jsx     # AI scholarship matcher
    │   │   ├── VisaGuide.jsx        # AI visa guides
    │   │   ├── Profile.jsx          # User profile editor
    │   │   ├── Favorites.jsx        # Saved universities
    │   │   └── AuthCallback.jsx     # OAuth callback handler
    │   ├── utils/
    │   │   └── api.js               # Axios instance with JWT interceptor
    │   ├── App.jsx                  # Main app with routing
    │   ├── main.jsx                 # Entry point
    │   └── index.css                # Global styles
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for Nodemailer)
- OpenAI API key (optional — AI features have fallbacks)

### 1. Clone & Install

```bash
cd "Study abroad platform"

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend `.env`:**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/StudyAbroad?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_secret_key_min_32_chars
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-digit-app-password
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
OPENAI_API_KEY=sk-your-openai-api-key-here
CLIENT_URL=http://localhost:5173
```

**Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → Generate

**OpenAI API Key:** https://platform.openai.com/api-keys (optional — fallback works without it)

### 3. Seed Database

```bash
cd backend
node server.js
```

Then visit: `http://localhost:5000/api/universities/seed`

This will populate 12 universities (Oxford, Harvard, TU Munich, ETH Zurich, Toronto, Melbourne, NUS, Delft, UBC, NUST, LUMS, Bedfordshire).

### 4. Run Development Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/send-otp` — Send OTP to email
- `POST /api/auth/register` — Register with OTP verification
- `POST /api/auth/login` — Login with email/password
- `POST /api/auth/forgot-password` — Send password reset OTP
- `POST /api/auth/reset-password` — Reset password with OTP
- `POST /api/auth/google` — Google OAuth verification
- `GET /api/auth/github/callback` — GitHub OAuth callback
- `GET /api/auth/profile` — Get user profile (protected)
- `PUT /api/auth/profile` — Update profile (protected)
- `POST /api/auth/favorites/:uniId` — Toggle favorite (protected)

### Universities
- `GET /api/universities` — List with filters (country, maxPrice, search, etc.)
- `GET /api/universities/:id` — Get single university
- `GET /api/universities/seed` — Seed database (dev helper)
- `POST /api/universities/add` — Add university (admin only)
- `PUT /api/universities/:id` — Update university (admin only)
- `DELETE /api/universities/:id` — Soft delete (admin only)

### Applications
- `POST /api/applications` — Submit application (protected)
- `GET /api/applications` — Get my applications (protected)
- `GET /api/applications/stats` — Dashboard stats (protected)
- `GET /api/applications/:id` — Get single application (protected)
- `PUT /api/applications/:id/status` — Update status (admin/counselor)
- `GET /api/applications/admin/all` — All applications (admin)

### AI Features
- `POST /api/ai/chat` — AI chatbot (protected, rate-limited)
- `POST /api/ai/predict-eligibility` — AI eligibility predictor (protected, rate-limited)
- `GET /api/ai/visa-guide/:country` — AI visa guide (protected)
- `POST /api/ai/match-scholarships` — AI scholarship matcher (protected, rate-limited)

### Notifications
- `GET /api/notifications` — Get notifications (protected)
- `PUT /api/notifications/read-all` — Mark all as read (protected)
- `PUT /api/notifications/:id/read` — Mark single as read (protected)

### Admin
- `GET /api/admin/analytics` — Platform analytics (admin only)
- `GET /api/admin/users` — All users (admin only)
- `PUT /api/admin/users/:id/role` — Change user role (admin only)
- `PUT /api/admin/users/:id/ban` — Ban/unban user (admin only)

---

## 🎯 Key Features Walkthrough

### 1. Register & Login
1. Visit http://localhost:5173
2. Click "Get Started" → Register
3. Enter name, email, password
4. Click "Send Verification Code"
5. Check email for 6-digit OTP
6. Enter OTP → Account created
7. Login with email/password OR Google/GitHub

### 2. Browse Universities
1. After login → Dashboard
2. Click "Universities" in nav
3. Use filters: country, budget slider, scholarships
4. Search by name/city/country
5. Click heart icon to save favorites
6. Click "View Details" for full info

### 3. AI Eligibility Check
1. Click "AI Match" in nav
2. Enter CGPA, IELTS, budget, country
3. Click "Predict My Chances"
4. See ranked universities with match scores (0-100%)
5. Color-coded likelihood: High (green), Medium (yellow), Low (red)

### 4. AI Chatbot
1. Click floating robot icon (bottom-right)
2. Ask questions like:
   - "Best universities in Germany"
   - "UK visa requirements"
   - "Scholarships for CS students"
3. Get instant AI-powered answers

### 5. Apply to University
1. Go to university detail page
2. Click "Apply Now"
3. Fill application form (program, CGPA, IELTS, start date)
4. Submit → Application tracked in "Applications" page
5. Receive email notification on status changes

### 6. Track Applications
1. Click "Applications" in nav
2. See all applications with status badges
3. Filter by status (draft, submitted, under review, accepted, rejected)
4. Visual progress stepper shows current stage

---

## 🔧 Configuration Notes

### MongoDB Atlas
- Free tier (M0) is sufficient
- Whitelist IP: 0.0.0.0/0 (allow from anywhere) OR your specific IP
- If cluster is paused, resume it from Atlas dashboard

### Gmail SMTP
- Enable 2-Step Verification
- Generate App Password (16 digits, no spaces)
- Use this as `EMAIL_PASS` in .env

### OpenAI API
- Optional — AI features have smart fallbacks
- Without API key: rule-based eligibility scoring, pre-written visa guides, built-in scholarship data
- With API key: Enhanced AI responses, dynamic content generation

### OAuth Setup
**Google:**
1. Go to https://console.cloud.google.com
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Authorized redirect URIs: `http://localhost:5173`
5. Copy Client ID to frontend code and .env

**GitHub:**
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Secret to .env

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in .env
- Ensure MongoDB Atlas cluster is not paused
- Verify all required env vars are set

### Frontend build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (18+)

### OTP emails not sending
- Verify Gmail App Password (16 digits, no spaces)
- Check EMAIL_USER and EMAIL_PASS in .env
- Ensure 2-Step Verification is enabled on Gmail

### AI features not working
- Check OPENAI_API_KEY in .env
- Verify API key is valid and has credits
- Fallback responses will work without API key

### Universities not loading
- Run seed endpoint: `GET http://localhost:5000/api/universities/seed`
- Check MongoDB connection
- Verify backend is running on port 5000

---

## 📊 Database Schema

### User
- name, email, password (hashed)
- googleId, githubId, profilePicture
- role (student/counselor/admin)
- cgpa, ielts, budget, preferredCountry
- favorites (array of university IDs)
- emailNotifications (boolean)

### University
- name, country, city, description, website
- ranking, fees, living_cost, currency
- eligibility (min_cgpa, ielts, gre, entry_test)
- visa_time, applicationDeadline
- courses (array), scholarships (array)
- isActive (soft delete)

### Application
- userId, universityId, program, startDate
- status (draft/submitted/under_review/accepted/rejected/waitlisted)
- documents (array with docType, filename, url, status)
- academicInfo (cgpa, ielts, gre)
- notes, internalNotes
- assignedCounselor

### Notification
- userId, type, title, body, read, link

---

## 🚀 Production Deployment

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect repo to hosting platform
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.com`

### Update API URL
In `frontend/src/utils/api.js`, change:
```js
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
```

---

## 📝 Future Enhancements

- [ ] Admin dashboard with charts (recharts)
- [ ] Document upload to cloud (Cloudinary/AWS S3)
- [ ] Real-time chat (Socket.io)
- [ ] University comparison tool (side-by-side)
- [ ] SOP/CV AI reviewer with file upload
- [ ] Deadline reminder cron job
- [ ] Payment integration for application fees
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)

---

## 👨‍💻 Developer

**Esha Liaqat**
- Platform: StudyAbroad.ai
- Stack: MERN + AI
- Year: 2026

---

## 📄 License

ISC

---

## 🎉 You're All Set!

Both servers are running:
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173

**Next Steps:**
1. Register a new account
2. Verify email with OTP
3. Browse universities
4. Try AI eligibility predictor
5. Chat with AI assistant
6. Apply to universities
7. Track applications

**Need help?** Check the troubleshooting section above or review the API endpoints.

Happy coding! 🚀
