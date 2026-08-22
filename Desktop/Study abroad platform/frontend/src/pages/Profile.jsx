import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Footer from '../components/Footer';

const Profile = () => {
  const { user, setUser } = useAuth();
  
  const [form, setForm] = useState({
    name: 'Esha Liaqat',
    phone: '03141641324',
    country: 'Pakistan',
    cgpa: '3.12',
    ielts: '5.5',
    budget: '450000 to 60000',
    preferredCountry: 'Australia',
    emailNotifications: true,
  });
  const [loading, setLoading] = useState(false);

  // Jab AuthContext se user fetch hokar aaye, inputs ko live update karein
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || 'Esha liaqat',
        phone: user.phone || '03141641324',
        country: user.country || 'Pakistan',
        cgpa: user.cgpa || '3.12',
        ielts: user.ielts || '5.5',
        budget: user.budget || '450000 to 60000',
        preferredCountry: user.preferredCountry || 'Australia',
        emailNotifications: user.emailNotifications ?? true,
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      const updatedData = res.data.data || res.data.user || res.data;
      
      setUser(updatedData);
      localStorage.setItem('user', JSON.stringify(updatedData)); // Sync with localStorage
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '40px', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          <img 
            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=100`}
            alt="avatar" 
            style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)' }} 
          />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'white', margin: '0 0 4px' }}>{user?.name || 'User'}</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>{user?.email} • {user?.role}</p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSave}
          style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>

          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>Personal Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+92 300 0000000' },
              { key: 'country', label: 'Home Country', type: 'text', placeholder: 'Pakistan' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>Academic Profile</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>This helps our AI give you better university and scholarship matches.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {[
              { key: 'cgpa', label: 'CGPA (out of 4.0)', type: 'number', step: '0.01', min: '0', max: '4', placeholder: 'e.g. 3.4' },
              { key: 'ielts', label: 'IELTS Score', type: 'number', step: '0.5', min: '0', max: '9', placeholder: 'e.g. 7.0' },
              { key: 'budget', label: 'Annual Budget ($)', type: 'number', placeholder: 'e.g. 25000' },
              { key: 'preferredCountry', label: 'Preferred Country', type: 'text', placeholder: 'e.g. Germany' },
            ].map(({ key, label, type, step, min, max, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</label>
                <input type={type} step={step} min={min} max={max} placeholder={placeholder} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
            <input type="checkbox" id="emailNotif" checked={form.emailNotifications}
              onChange={e => setForm({ ...form, emailNotifications: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }} />
            <label htmlFor="emailNotif" style={{ fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
              📧 Receive email notifications for application updates and deadlines
            </label>
          </div>

          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : '✓ Save Changes'}
          </motion.button>
        </motion.form>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;