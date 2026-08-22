import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP');
    setStep(3);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) return toast.error('Passwords do not match');
    if (newPass.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: newPass });
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { icon: '📧', title: 'Reset Password', subtitle: 'Enter your email to receive a reset code' },
    { icon: '🔢', title: 'Verify OTP', subtitle: `We sent a 6-digit code to ${email}` },
    { icon: '🔐', title: 'New Password', subtitle: 'Create a strong new password' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '40px 20px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'linear-gradient(135deg,#6366f1,#a855f7)' : '#e2e8f0', transition: '0.3s' }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>{steps[step - 1].icon}</div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>{steps[step - 1].title}</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{steps[step - 1].subtitle}</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <input type="email" required placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending...' : 'Send Reset Code →'}
            </motion.button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <input type="text" maxLength="6" required placeholder="0 0 0 0 0 0" value={otp} onChange={e => setOtp(e.target.value)}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #6366f1', fontSize: '28px', textAlign: 'center', letterSpacing: '12px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }} />
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              Verify Code →
            </motion.button>
            <button type="button" onClick={() => setStep(1)} style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}>
              ← Change Email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset}>
            <input type="password" required placeholder="New password (min. 8 chars)" value={newPass} onChange={e => setNewPass(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            <input type="password" required placeholder="Confirm new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Updating...' : '✓ Update Password'}
            </motion.button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#6366f1', fontSize: '14px', textDecoration: 'none', fontWeight: '600' }}>← Back to Login</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
