# StudyAbroad.ai — Enterprise Platform Requirements

## Overview

StudyAbroad.ai is a full-stack AI-powered study abroad guidance platform. Students discover universities, check eligibility, track applications, and get AI-driven advice. Counselors manage students. Admins manage the entire platform.

The current codebase has a working skeleton with hardcoded data, disconnected auth, and placeholder AI. This spec covers the complete build-out to enterprise level.

---

## Actors

- **Student** — primary user, discovers universities, applies, tracks progress
- **Counselor** — assigned to students, reviews applications, provides guidance
- **Admin** — manages universities, users, content, and analytics
- **AI Engine** — OpenAI GPT-4o integration for chatbot, eligibility, document review

---

## Module 1: Authentication & User Management

### REQ-AUTH-01 — Wire Login to Backend
**User Story:** As a student, I want to log in with my email and password so that I can access my personalized dashboard.

**Acceptance Criteria:**
- Login form calls `POST /api/auth/login` with email and password
- On success, JWT token is stored in `localStorage` (key: `token`) and user object in `AuthContext`
- On failure, a clear error message is shown inline (not alert)
- After login, user is redirected to `/dashboard`
- Token expiry (1h) triggers automatic logout and redirect to `/login`

### REQ-AUTH-02 — AuthContext Integration
**User Story:** As a developer, I want a global auth state so that all components know if the user is logged in without prop drilling.

**Acceptance Criteria:**
- `AuthContext.jsx` provides `{ user, token, login, logout, isAuthenticated }` to the entire app
- `App.jsx` uses `AuthContext` instead of local `useState` for auth state
- `ProtectedRoute` reads from `AuthContext`
- On page refresh, auth state is restored from `localStorage` token (validate with `/api/auth/profile`)

### REQ-AUTH-03 — Complete ForgotPassword Flow
**User Story:** As a student, I want to reset my password via email OTP so that I can recover my account.

**Acceptance Criteria:**
- Backend route `POST /api/auth/forgot-password` sends OTP to email
- Backend route `POST /api/auth/reset-password` verifies OTP and updates hashed password
- Frontend ForgotPassword.jsx calls real backend (remove mock)
- OTP expires in 10 minutes
- Password must be minimum 8 characters with at least one number

### REQ-AUTH-04 — Google OAuth Backend Verification
**User Story:** As a student, I want to sign in with Google so that I don't need to remember a password.

**Acceptance Criteria:**
- Backend route `POST /api/auth/google` accepts Google ID token
- Backend verifies token using `google-auth-library`
- If user doesn't exist, auto-creates account with `googleId` field
- Returns JWT same as regular login
- Frontend sends credential to backend instead of just logging in client-side

### REQ-AUTH-05 — GitHub OAuth Backend Callback
**User Story:** As a student, I want to sign in with GitHub so that I have a quick login option.

**Acceptance Criteria:**
- Backend route `GET /api/auth/github/callback` exchanges GitHub code for access token
- Fetches user email from GitHub API
- Creates or finds user, returns JWT
- Frontend redirects to backend callback URL instead of handling code client-side

### REQ-AUTH-06 — User Profile Management
**User Story:** As a student, I want to view and edit my profile so that my information stays current.

**Acceptance Criteria:**
- Profile page at `/profile` shows name, email, profile picture, joined date
- Student can update name and upload profile picture (stored as URL or base64)
- Backend route `PUT /api/auth/profile` updates user record
- Email change requires OTP re-verification
- Password change requires current password confirmation

### REQ-AUTH-07 — Role-Based Access Control
**User Story:** As an admin, I want role-based access so that students cannot access admin features.

**Acceptance Criteria:**
- User model has `role` field: `student` | `counselor` | `admin` (default: `student`)
- Backend middleware `authorize(...roles)` checks role after `protect`
- Admin routes reject non-admin tokens with 403
- Frontend hides admin nav links for non-admin users
- Counselor can view assigned students' applications only

---

## Module 2: University Discovery & Search

### REQ-UNI-01 — Live API Data
**User Story:** As a student, I want to see real university data from the database so that information is accurate and up to date.

**Acceptance Criteria:**
- `Home.jsx` fetches universities from `GET /api/universities` on mount
- `Assessment.jsx` fetches from the same API with filter params
- Loading skeleton shown while fetching
- Error state shown if API fails with retry button
- Hardcoded university arrays removed from all frontend files

### REQ-UNI-02 — Advanced Search & Filters
**User Story:** As a student, I want to filter universities by multiple criteria so that I find the best match quickly.

**Acceptance Criteria:**
- Filters: country, max annual fee, min/max ranking, IELTS score range, available scholarships (yes/no), course/program name
- All filters are applied server-side via query params
- URL updates with filter state so results are shareable/bookmarkable
- "Clear All Filters" resets to default state
- Result count shown: "Showing 12 of 48 universities"

### REQ-UNI-03 — University Comparison Tool
**User Story:** As a student, I want to compare up to 3 universities side by side so that I can make an informed decision.

**Acceptance Criteria:**
- "Compare" checkbox on each UniversityCard (max 3 selectable)
- Sticky comparison bar at bottom shows selected universities
- `/compare` page renders a table: fees, ranking, IELTS, CGPA, visa time, scholarships
- Differences highlighted in color (green = better, red = worse)
- Comparison state persists across page navigation within session

### REQ-UNI-04 — Favorites & Bookmarking
**User Story:** As a student, I want to save universities to a favorites list so that I can revisit them later.

**Acceptance Criteria:**
- Heart/bookmark icon on each UniversityCard
- Clicking saves/removes from favorites via `POST /api/users/favorites/:uniId`
- Favorites list accessible at `/favorites`
- Favorites count shown in Navbar
- Favorites persist in database linked to user account

### REQ-UNI-05 — Pagination & Infinite Scroll
**User Story:** As a student, I want to browse a large list of universities without the page becoming slow.

**Acceptance Criteria:**
- Backend supports `page` and `limit` query params (default limit: 12)
- Frontend implements infinite scroll — loads next page when user scrolls to 80% of list
- "Load More" fallback button if scroll detection fails
- Total count and current page shown

---

## Module 3: AI-Powered Features

### REQ-AI-01 — AI Eligibility Predictor
**User Story:** As a student, I want an AI to predict my admission chances so that I apply to the right universities.

**Acceptance Criteria:**
- Assessment form collects: CGPA, IELTS score, GRE score (optional), budget, preferred country, intended program
- Backend `POST /api/ai/predict-eligibility` sends profile to OpenAI with a structured prompt
- AI returns a ranked list of universities with: match percentage, acceptance likelihood (High/Medium/Low), missing requirements
- Results displayed as cards with color-coded likelihood badges
- If OpenAI is unavailable, falls back to rule-based scoring (CGPA + budget filter)
- Response cached per unique input combination for 24 hours

### REQ-AI-02 — AI Chatbot (Real Integration)
**User Story:** As a student, I want to chat with an AI assistant so that I get instant answers about universities, visas, and scholarships.

**Acceptance Criteria:**
- Chat widget accessible from all pages (floating button bottom-right)
- Backend `POST /api/ai/chat` proxies messages to OpenAI GPT-4o with a system prompt defining the assistant as a study abroad expert
- Conversation history maintained per session (last 10 messages sent as context)
- Typing indicator shown while waiting for response
- Suggested quick-reply prompts: "Best universities in Germany", "UK visa requirements", "Scholarships for CS students"
- Chat history saved to user account (last 30 days)
- Rate limited: 20 messages per user per hour

### REQ-AI-03 — AI Document Reviewer
**User Story:** As a student, I want AI feedback on my SOP and CV so that I can improve them before applying.

**Acceptance Criteria:**
- Upload interface accepts PDF and DOCX files (max 5MB)
- Backend extracts text from document (using `pdf-parse` or `mammoth`)
- Text sent to OpenAI with prompt: "Review this Statement of Purpose for a university application. Give structured feedback on: clarity, structure, grammar, and persuasiveness."
- AI response displayed as structured feedback with sections and bullet points
- User can re-upload revised document and compare feedback
- Document stored temporarily (24 hours), not permanently

### REQ-AI-04 — AI Scholarship Matcher
**User Story:** As a student, I want AI to suggest scholarships I qualify for so that I don't miss funding opportunities.

**Acceptance Criteria:**
- Scholarship model added to database: name, country, amount, eligibility criteria, deadline, link
- Backend `POST /api/ai/match-scholarships` sends user profile to OpenAI
- AI returns top 5 matching scholarships with explanation of why each matches
- Results shown on a dedicated `/scholarships` page
- Manual scholarship search also available (filter by country, amount, deadline)

### REQ-AI-05 — AI Visa Guidance
**User Story:** As a student, I want step-by-step visa guidance for my target country so that I don't miss any requirements.

**Acceptance Criteria:**
- Backend `GET /api/ai/visa-guide/:country` generates a visa guide using OpenAI
- Guide includes: required documents, processing time, fees, interview tips, common rejection reasons
- Response cached per country for 7 days (visa rules don't change frequently)
- Displayed as an accordion/step-by-step UI on UniversityDetail and a dedicated `/visa-guide/:country` page
- "Last updated" timestamp shown

---

## Module 4: Application Tracking System

### REQ-APP-01 — Submit Application
**User Story:** As a student, I want to apply to a university through the platform so that I can track everything in one place.

**Acceptance Criteria:**
- "Apply Now" button on UniversityDetail opens a multi-step application form
- Form collects: personal info, academic history, intended program, start date, documents
- Backend `POST /api/applications` creates application record linked to user and university
- Application model: `{ userId, universityId, status, documents[], notes, createdAt, updatedAt }`
- Duplicate application to same university prevented (one active application per university per user)

### REQ-APP-02 — Application Status Pipeline
**User Story:** As a student, I want to see my application status so that I know where I stand.

**Acceptance Criteria:**
- Status values: `draft` → `submitted` → `under_review` → `accepted` | `rejected` | `waitlisted`
- Status shown as a visual progress stepper on application detail page
- Admin/Counselor can update status via `PUT /api/applications/:id/status`
- Status change triggers email notification to student
- Student cannot move status backward

### REQ-APP-03 — Document Upload per Application
**User Story:** As a student, I want to upload my documents per application so that everything is organized.

**Acceptance Criteria:**
- Documents: SOP, CV, transcripts, recommendation letters, passport copy, IELTS certificate
- File upload via `multer` middleware, stored in `/uploads` folder or cloud (Cloudinary)
- Each document has: type, filename, uploadedAt, status (pending/approved/rejected)
- Max file size: 10MB per file, max 10 files per application
- Admin can mark individual documents as approved or request re-upload

### REQ-APP-04 — Application Dashboard
**User Story:** As a student, I want a dashboard showing all my applications so that I can manage them easily.

**Acceptance Criteria:**
- `/dashboard` shows: active applications count, accepted count, pending count, upcoming deadlines
- Application list with status badges, university name, program, last updated date
- Click on application opens detail view
- Filter applications by status
- Export applications list as PDF

### REQ-APP-05 — Deadline Reminders
**User Story:** As a student, I want email reminders before application deadlines so that I never miss one.

**Acceptance Criteria:**
- University model includes `applicationDeadline` date field
- Cron job runs daily at 8 AM, checks for deadlines in next 7 days and 1 day
- Sends reminder email to students with pending applications
- Student can opt out of reminders in profile settings
- Reminder log stored to prevent duplicate emails

---

## Module 5: Admin Panel

### REQ-ADMIN-01 — University CRUD
**User Story:** As an admin, I want to manage university records so that the platform data stays accurate.

**Acceptance Criteria:**
- Admin panel at `/admin/universities` lists all universities with edit/delete actions
- Add university form with all fields: name, country, city, ranking, fees, IELTS, CGPA, courses, scholarships, description, website, logo URL
- Bulk import via CSV upload (columns mapped to University model fields)
- Soft delete (set `isActive: false`) instead of hard delete
- Changes logged with admin user ID and timestamp

### REQ-ADMIN-02 — User Management
**User Story:** As an admin, I want to manage user accounts so that I can handle abuse and role assignments.

**Acceptance Criteria:**
- `/admin/users` lists all users with: name, email, role, joined date, application count
- Admin can change user role (student ↔ counselor)
- Admin can ban/unban user (banned users get 403 on login)
- Search users by name or email
- View any user's application history

### REQ-ADMIN-03 — Application Review Dashboard
**User Story:** As an admin/counselor, I want to review all applications so that I can process them efficiently.

**Acceptance Criteria:**
- `/admin/applications` lists all applications with filters: status, university, date range
- Bulk status update (select multiple → change status)
- Download application documents as ZIP
- Add internal notes to application (not visible to student)
- Assign application to a counselor

### REQ-ADMIN-04 — Analytics Dashboard
**User Story:** As an admin, I want to see platform analytics so that I can make data-driven decisions.

**Acceptance Criteria:**
- `/admin/analytics` shows:
  - Total registered users (with growth chart — last 30 days)
  - Applications per university (bar chart)
  - Application status distribution (pie chart)
  - Top 5 most-viewed universities
  - AI chatbot usage (messages per day)
  - Conversion rate: profile created → application submitted
- Charts built with `recharts` or `chart.js`
- Date range picker to filter analytics period
- Export analytics as CSV

---

## Module 6: Notifications & Communication

### REQ-NOTIF-01 — In-App Notification Center
**User Story:** As a student, I want in-app notifications so that I don't miss important updates.

**Acceptance Criteria:**
- Bell icon in Navbar with unread count badge
- Notification dropdown shows last 10 notifications
- Notification types: application status change, document approved/rejected, deadline reminder, new message
- Mark as read individually or "Mark all as read"
- Notifications stored in database, linked to user

### REQ-NOTIF-02 — Email Notifications
**User Story:** As a student, I want email notifications for important events so that I stay informed even when offline.

**Acceptance Criteria:**
- Email sent on: registration success, application submitted, status change, document feedback, deadline reminder
- HTML email templates (consistent branding with StudyAbroad.ai logo and colors)
- Unsubscribe link in every email (sets `emailNotifications: false` on user)
- Emails sent via existing Nodemailer/Gmail setup

### REQ-NOTIF-03 — Counselor Messaging
**User Story:** As a student, I want to message my assigned counselor so that I can get personalized guidance.

**Acceptance Criteria:**
- Simple messaging system: student ↔ assigned counselor only
- Messages stored in database: `{ senderId, receiverId, content, timestamp, read }`
- `/messages` page shows conversation thread
- New message triggers email notification to recipient
- Counselor can be assigned to student by admin

---

## Module 7: Performance, Security & Infrastructure

### REQ-SEC-01 — Rate Limiting
**Acceptance Criteria:**
- `express-rate-limit` applied to: `/api/auth/*` (10 req/15min), `/api/ai/*` (20 req/hour per user)
- Rate limit headers returned in response
- Exceeded limit returns 429 with retry-after time

### REQ-SEC-02 — Input Validation & Sanitization
**Acceptance Criteria:**
- `express-validator` used on all POST/PUT routes
- Email format, password strength, CGPA range (0.0–4.0), file type validation enforced server-side
- MongoDB injection prevented via Mongoose schema types (already in place)
- XSS prevention via `helmet` middleware

### REQ-SEC-03 — Security Headers & CORS
**Acceptance Criteria:**
- `helmet` middleware added to Express app
- CORS configured with explicit allowed origins (not `*` in production)
- JWT secret minimum 32 characters, stored in `.env`
- Sensitive `.env` values never logged or returned in API responses

### REQ-SEC-04 — Error Handling & Logging
**Acceptance Criteria:**
- Global error handler middleware in Express catches unhandled errors
- All errors logged with: timestamp, route, error message, stack trace (dev only)
- `morgan` HTTP request logger added
- Client receives generic error message (not stack trace) in production
- 404 handler for unknown routes

### REQ-SEC-05 — API Response Caching
**Acceptance Criteria:**
- University list responses cached in-memory for 5 minutes (node-cache or simple Map)
- AI visa guide responses cached per country for 7 days
- AI eligibility predictions cached per unique input hash for 24 hours
- Cache invalidated when university data is updated by admin

### REQ-SEC-06 — Environment Configuration
**Acceptance Criteria:**
- `.env.example` file documents all required environment variables
- Required variables: `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `CLIENT_URL`, `PORT`
- App fails fast with clear error message if required env vars are missing on startup

---

## New Backend Routes Summary

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/forgot-password | Public | Send reset OTP |
| POST | /api/auth/reset-password | Public | Verify OTP, update password |
| POST | /api/auth/google | Public | Google OAuth verification |
| GET | /api/auth/github/callback | Public | GitHub OAuth callback |
| PUT | /api/auth/profile | Student | Update profile |
| GET | /api/universities | Public | List with filters + pagination |
| GET | /api/universities/:id | Public | Single university detail |
| PUT | /api/universities/:id | Admin | Update university |
| DELETE | /api/universities/:id | Admin | Soft delete university |
| POST | /api/universities/bulk-import | Admin | CSV bulk import |
| POST | /api/users/favorites/:uniId | Student | Toggle favorite |
| GET | /api/users/favorites | Student | Get favorites list |
| POST | /api/applications | Student | Submit application |
| GET | /api/applications | Student | Get own applications |
| GET | /api/applications/:id | Student/Admin | Application detail |
| PUT | /api/applications/:id/status | Admin/Counselor | Update status |
| POST | /api/applications/:id/documents | Student | Upload document |
| POST | /api/ai/chat | Student | AI chatbot message |
| POST | /api/ai/predict-eligibility | Student | AI eligibility prediction |
| POST | /api/ai/review-document | Student | AI document review |
| POST | /api/ai/match-scholarships | Student | AI scholarship matching |
| GET | /api/ai/visa-guide/:country | Student | AI visa guide |
| GET | /api/notifications | Student | Get notifications |
| PUT | /api/notifications/read | Student | Mark as read |
| GET | /api/messages/:userId | Student/Counselor | Get conversation |
| POST | /api/messages | Student/Counselor | Send message |
| GET | /api/admin/analytics | Admin | Platform analytics |
| GET | /api/admin/users | Admin | All users |
| PUT | /api/admin/users/:id/role | Admin | Change user role |
| PUT | /api/admin/users/:id/ban | Admin | Ban/unban user |

---

## New Frontend Pages & Components

| Path | Component | Description |
|------|-----------|-------------|
| /dashboard | Dashboard.jsx | Student home with stats and applications |
| /profile | Profile.jsx | Edit profile, settings |
| /favorites | Favorites.jsx | Saved universities |
| /compare | Compare.jsx | Side-by-side university comparison |
| /scholarships | Scholarships.jsx | AI scholarship matching |
| /visa-guide/:country | VisaGuide.jsx | AI-generated visa guide |
| /applications | Applications.jsx | Application list |
| /applications/:id | ApplicationDetail.jsx | Single application detail |
| /messages | Messages.jsx | Counselor chat |
| /admin | AdminLayout.jsx | Admin panel wrapper |
| /admin/universities | AdminUniversities.jsx | University CRUD |
| /admin/users | AdminUsers.jsx | User management |
| /admin/applications | AdminApplications.jsx | Application review |
| /admin/analytics | AdminAnalytics.jsx | Charts and stats |
| — | ChatWidget.jsx | Floating AI chatbot (all pages) |
| — | NotificationCenter.jsx | Bell dropdown in Navbar |
| — | CompareBar.jsx | Sticky comparison bar |

---

## New Dependencies Required

### Backend
```
npm install express-rate-limit express-validator helmet morgan
npm install google-auth-library axios
npm install multer pdf-parse mammoth
npm install node-cache node-cron
npm install openai
```

### Frontend
```
npm install axios
npm install recharts
npm install react-hot-toast
npm install @tanstack/react-query
```

---

## Data Model Additions

### User (extended)
```js
{
  role: { type: String, enum: ['student', 'counselor', 'admin'], default: 'student' },
  googleId: String,
  githubId: String,
  profilePicture: String,
  phone: String,
  country: String,
  isBanned: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  assignedCounselor: { type: ObjectId, ref: 'User' },
  favorites: [{ type: ObjectId, ref: 'University' }]
}
```

### Application
```js
{
  userId: { type: ObjectId, ref: 'User', required: true },
  universityId: { type: ObjectId, ref: 'University', required: true },
  program: String,
  startDate: Date,
  status: { type: String, enum: ['draft','submitted','under_review','accepted','rejected','waitlisted'], default: 'draft' },
  documents: [{ type: String, docType: String, uploadedAt: Date, status: String }],
  notes: String,
  internalNotes: String,
  assignedCounselor: { type: ObjectId, ref: 'User' }
}
```

### Notification
```js
{
  userId: { type: ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['status_change','document_feedback','deadline','message','system'] },
  title: String,
  body: String,
  read: { type: Boolean, default: false },
  link: String
}
```

### Message
```js
{
  senderId: { type: ObjectId, ref: 'User' },
  receiverId: { type: ObjectId, ref: 'User' },
  content: String,
  read: { type: Boolean, default: false }
}
```

### Scholarship
```js
{
  name: String,
  country: String,
  amount: Number,
  currency: { type: String, default: 'USD' },
  eligibilityCriteria: String,
  deadline: Date,
  link: String,
  isActive: { type: Boolean, default: true }
}
```

### University (extended)
```js
{
  eligibility: {
    min_cgpa: Number,
    ielts: Number,
    gre: Number,
    entry_test: String
  },
  visa_time: String,
  applicationDeadline: Date,
  scholarships: [String],
  isActive: { type: Boolean, default: true }
}
```

---

## Implementation Priority

| Priority | Module | Effort |
|----------|--------|--------|
| P0 — Critical | Auth wiring (REQ-AUTH-01, 02, 03) | 1 day |
| P0 — Critical | Live university API (REQ-UNI-01) | 0.5 day |
| P1 — High | AI Chatbot (REQ-AI-02) | 1 day |
| P1 — High | AI Eligibility Predictor (REQ-AI-01) | 1 day |
| P1 — High | Application Tracking (REQ-APP-01 to 04) | 2 days |
| P2 — Medium | Google/GitHub OAuth backend (REQ-AUTH-04, 05) | 1 day |
| P2 — Medium | Advanced Search & Comparison (REQ-UNI-02, 03) | 1 day |
| P2 — Medium | Admin Panel (REQ-ADMIN-01 to 04) | 2 days |
| P3 — Standard | AI Document Reviewer (REQ-AI-03) | 1 day |
| P3 — Standard | Notifications (REQ-NOTIF-01, 02) | 1 day |
| P3 — Standard | Scholarship Matcher (REQ-AI-04) | 1 day |
| P4 — Enhancement | Visa Guidance (REQ-AI-05) | 0.5 day |
| P4 — Enhancement | Counselor Messaging (REQ-NOTIF-03) | 1 day |
| P4 — Enhancement | Analytics Dashboard (REQ-ADMIN-04) | 1 day |
