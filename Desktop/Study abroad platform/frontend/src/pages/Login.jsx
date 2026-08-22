import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Suppress Google OAuth console errors
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('GSI') || args[0]?.includes?.('origin')) return;
    originalError.apply(console, args);
  };
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Handle GitHub callback error
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    if (error === 'banned') toast.error('Your account has been suspended.');
    if (error === 'github_failed') toast.error('GitHub login failed. Please try again.');
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const userData = res.data.user || res.data.data || null;
      const authToken = res.data.token || res.data.accessToken || null;
      if (!userData || !authToken) throw new Error('Invalid login response');
      login(userData, authToken);
      toast.success(`Welcome back, ${userData.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google login error. Please try again.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      login(res.data.user, res.data.token);
      toast.success(`Welcome, ${res.data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      toast.error(err.response?.data?.error || err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liaP3KfYowdtfN6O'}&scope=user:email`;
  };

  return (
    <GoogleOAuthProvider clientId="719520169928-uck2bogiumad16cn9n0m5eakbutubrm7.apps.googleusercontent.com">
      <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0f1e' }}>
        {/* Left Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', background: 'linear-gradient(135deg,#0a0f1e 0%,#1e1b4b 100%)' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🌍</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', background: 'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>StudyAbroad.ai</h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6' }}>Your AI-powered guide to global education. Find the perfect university, predict your chances, and track your applications — all in one place.</p>
            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['🤖 AI Eligibility Predictor', '🎓 1000+ Universities', '💰 Scholarship Matcher', '🛂 Visa Guidance'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '14px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Panel */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', background: '#f8fafc' }}>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Welcome back</h2>
            <p style={{ color: '#64748b', marginBottom: '28px', fontSize: '14px' }}>Sign in to continue your journey</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
                <input type="email" required placeholder="name@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: '0.2s', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} required placeholder="••••••••" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <Link to="/forgot-password" style={{ color: '#6366f1', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Forgot password?</Link>
              </div>

              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </motion.button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google login failed. Please try again.')}
                  theme="outline"
                  size="large"
                  width="340"
                  text="continue_with"
                  shape="rectangular"
                  useOneTap={false}
                  auto_select={false}
                  cancel_on_tap_outside={true}
                />
              </div>
              <button onClick={handleGitHubLogin}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#24292e', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark-Light.png" alt="github" width="18" />
                Continue with GitHub
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#6366f1', fontWeight: '700', textDecoration: 'none' }}>Create one free →</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
