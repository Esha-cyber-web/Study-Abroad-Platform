import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UniversityDetail from './pages/UniversityDetail';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Applications from './pages/Applications';
import Scholarships from './pages/Scholarships';
import VisaGuide from './pages/VisaGuide';
import AuthCallback from './pages/AuthCallback';
import SOPGenerator from './pages/SOPGenerator';
import CareerPredictor from './pages/CareerPredictor';
import CountryCompare from './pages/CountryCompare';
import InterviewPrep from './pages/InterviewPrep';
import BudgetPlanner from './pages/BudgetPlanner';
import IELTSCoach from './pages/IELTSCoach';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

// Custom Admin Guard Component
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();
  const { isDarkMode } = useTheme();

  if (loading) {
    return (
      <div 
        style={{ 
          height: '100vh', 
          display: 'flex', 
          justify: 'center', 
          alignItems: 'center', 
          background: isDarkMode ? '#030712' : '#f8fafc',
          color: isDarkMode ? '#f3f4f6' : '#0f172a'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #6366f1', 
              borderTopColor: 'transparent', 
              borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite', 
              margin: '0 auto' 
            }} 
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Determine default authenticated redirect based on role
  const defaultAuthRedirect = user?.role?.toLowerCase() === 'admin' ? '/admin' : '/dashboard';

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        position: 'relative',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={defaultAuthRedirect} /> : <Welcome />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={defaultAuthRedirect} /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={defaultAuthRedirect} /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Student Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
        <Route path="/university/:id" element={<ProtectedRoute><UniversityDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/scholarships" element={<ProtectedRoute><Scholarships /></ProtectedRoute>} />
        <Route path="/visa-guide/:country" element={<ProtectedRoute><VisaGuide /></ProtectedRoute>} />
        <Route path="/sop-generator" element={<ProtectedRoute><SOPGenerator /></ProtectedRoute>} />
        <Route path="/career-predictor" element={<ProtectedRoute><CareerPredictor /></ProtectedRoute>} />
        <Route path="/country-compare" element={<ProtectedRoute><CountryCompare /></ProtectedRoute>} />
        <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/budget-planner" element={<ProtectedRoute><BudgetPlanner /></ProtectedRoute>} />
        <Route path="/ielts-coach" element={<ProtectedRoute><IELTSCoach /></ProtectedRoute>} />

        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          } 
        />

        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isAuthenticated && <ChatWidget />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}